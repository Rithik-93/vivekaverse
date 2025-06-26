import  { useState } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Upload, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { toast } from "../hooks/use-toast";

const Index = () => {
  const [posFile, setPosFile] = useState<File | null>(null);
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [posType, setPosType] = useState<string>("");
  const [sourceType, setSourceType] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (file: File | File[], type: 'pos' | 'source') => {
    if (type === 'pos') {
      setPosFile(file as File);
    } else {
      const filesArray = Array.isArray(file) ? file : [file];
      setSourceFiles((prev) => [...prev, ...filesArray]);
    }

    // toast({
    //   title: "File uploaded successfully",
    //   description: Array.isArray(file)
    //     ? `${file.length} files have been uploaded.`
    //     : `${(file as File).name} has been uploaded.`,
    // });
  };

  const handleCompare = async () => {
    if (!posFile || !sourceFiles.length || !posType || !sourceType) {
      // toast({
      //   title: "Missing Information",
      //   description: "Please upload both files and select platform types.",
      //   variant: "destructive",
      // });
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('posFile', posFile);

      // Append each source file with the same field name: sourceFile
      sourceFiles.forEach((file) => {
        formData.append('sourceFile', file);
      });

      formData.append('posType', posType);
      formData.append('sourceType', sourceType);

      const response = await fetch('http://localhost:3000/api/process-excel-comparison', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to process files');
      }

      const data = await response.json();

      sessionStorage.setItem('comparisonData', JSON.stringify({
        posFile: posFile.name,
        sourceFiles: sourceFiles.map(f => f.name),
        posType,
        sourceType,
        results: data
      }));

      // toast({
      //   title: "Processing Complete!",
      //   description: `Found ${data.matchCount} exact matches out of ${data.totalPOSRecords} orders.`,
      // });

      navigate('/results');
    } catch (error) {
      console.error('Error during file processing:', error);
      // toast({
      //   title: "Processing Failed",
      //   description: "An error occurred while processing the files.",
      //   variant: "destructive",
      // });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Comparison System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your POS and source data files to compare and analyze order matches across different platforms
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* POS Upload Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-purple-700 flex items-center justify-center gap-2">
                <Upload className="h-6 w-6" />
                POS Data Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select POS Platform</label>
                <Select value={posType} onValueChange={setPosType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose POS platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petpooja">Pet Pooja</SelectItem>
                    <SelectItem value="ristas">Ristas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Upload Excel File</label>
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pos')}
                    className="hidden"
                    id="pos-upload"
                  />
                  <label htmlFor="pos-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {posFile ? posFile.name : "Click to upload POS Excel file"}
                    </p>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source Upload Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-blue-700 flex items-center justify-center gap-2">
                <Upload className="h-6 w-6" />
                Source Data Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Source Platform</label>
                <Select value={sourceType} onValueChange={setSourceType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose source platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="swiggy">Swiggy Dineout</SelectItem>
                    <SelectItem value="zomatopay">Zomato Pay</SelectItem>
                    <SelectItem value="eazydiner">Eazy Diner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Upload Excel File</label>
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    multiple
                    onChange={(e) =>
                      e.target.files && handleFileUpload(Array.from(e.target.files), 'source')
                    }
                    className="hidden"
                    id="source-upload"
                  />
                  <label htmlFor="source-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {sourceFiles.length > 0
                        ? sourceFiles.map((file) => file.name).join(", ")
                        : "Click to upload one or more Source Excel files"}
                    </p>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compare Button */}
        <div className="text-center">
          <Button
            onClick={handleCompare}
            size="lg"
            disabled={isProcessing || !posFile || !sourceFiles.length || !posType || !sourceType}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Files...
              </>
            ) : (
              <>
                Compare Orders
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;