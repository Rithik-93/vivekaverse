
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ArrowLeft, Download } from "lucide-react";

interface OrderDetail {
  id: string;
  posOrderId: string;
  sourceOrderId: string;
  posAmount: number;
  sourceAmount: number;
  difference: number;
  date: string;
  status: string;
}

const Details = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching detailed order data
    setTimeout(() => {
      const mockOrders: OrderDetail[] = Array.from({ length: 15 }, (_, i) => ({
        id: `ord_${i + 1}`,
        posOrderId: `POS${String(i + 1).padStart(4, '0')}`,
        sourceOrderId: category === 'unmatched' ? '-' : `SRC${String(i + 1).padStart(4, '0')}`,
        posAmount: Math.floor(Math.random() * 500) + 100,
        sourceAmount: category === 'unmatched' ? 0 : Math.floor(Math.random() * 500) + 100,
        difference: category === 'matched' ? 0 : Math.floor(Math.random() * 50) - 25,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: category || 'unknown'
      }));
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, [category]);

  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case 'matched':
        return { title: 'Matched Orders', color: 'green', description: 'Orders with exact bill amount matches' };
      case 'probable':
        return { title: 'Probable Matches', color: 'yellow', description: 'Orders with similar amounts (±5%)' };
      case 'summarized':
        return { title: 'Summarized Matches', color: 'blue', description: 'Multiple orders grouped together' };
      case 'unmatched':
        return { title: 'Unmatched Orders', color: 'red', description: 'Orders with no corresponding match' };
      default:
        return { title: 'Order Details', color: 'gray', description: 'Detailed order information' };
    }
  };

  const categoryInfo = getCategoryInfo(category || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/results')}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
          
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{categoryInfo.title}</h1>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6">{categoryInfo.description}</p>
          
          <Badge 
            className={`px-3 py-1 ${
              categoryInfo.color === 'green' ? 'bg-green-100 text-green-800' :
              categoryInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              categoryInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}
          >
            {orders.length} orders found
          </Badge>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>POS Order ID</TableHead>
                    <TableHead>Source Order ID</TableHead>
                    <TableHead>POS Amount</TableHead>
                    <TableHead>Source Amount</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium">{order.posOrderId}</TableCell>
                      <TableCell>{order.sourceOrderId}</TableCell>
                      <TableCell>₹{order.posAmount}</TableCell>
                      <TableCell>{order.sourceAmount > 0 ? `₹${order.sourceAmount}` : '-'}</TableCell>
                      <TableCell>
                        <span className={`${
                          order.difference === 0 ? 'text-green-600' :
                          Math.abs(order.difference) <= 10 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {order.difference === 0 ? '₹0' : 
                           order.difference > 0 ? `+₹${order.difference}` : 
                           `₹${order.difference}`}
                        </span>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${
                            order.status === 'matched' ? 'bg-green-100 text-green-800' :
                            order.status === 'probable' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'summarized' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Details;
