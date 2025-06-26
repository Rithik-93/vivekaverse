import { useEffect, useState } from 'react';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "../components/ui/select";

const Results = () => {
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("ALL");

  useEffect(() => {
    const stored = sessionStorage.getItem("comparisonData");
    if (stored) {
      const parsed = JSON.parse(stored).results;
      setComparisonData(parsed);
    }
  }, []);

  if (!comparisonData) return <p className="text-center mt-20">No data found.</p>;

  const allDates = [
    ...comparisonData.matchedValues,
    ...comparisonData.unmatchedInPos,
    ...comparisonData.unmatchedInSource,
    ...comparisonData.probableMatches.map((entry: any) => ({ date: entry.date })),
    ...comparisonData.combinedProbableMatches.map((entry: any) => ({ date: entry.date })),
    ...comparisonData.midnightMatches.map((entry: any) => ({ date: entry.posDate }))
  ].map((d) => d.date);

  const uniqueDates = Array.from(new Set(allDates)).sort();

  const dateMapByMonth: Record<string, string[]> = {};
  uniqueDates.forEach((date) => {
    const [year, month] = date.split("-");
    const monthKey = `${year}-${month}`;
    if (!dateMapByMonth[monthKey]) dateMapByMonth[monthKey] = [];
    dateMapByMonth[monthKey].push(date);
  });

  const months = Object.keys(dateMapByMonth).sort();

  const filterByDate = (arr: any[], key = "date") => {
    if (!selectedDate || selectedDate === "ALL") {
      return arr.filter((entry) => entry[key].startsWith(selectedMonth));
    }
    return arr.filter((entry) => entry[key] === selectedDate);
  };

  const filterMidnight = () => {
    if (!selectedDate || selectedDate === "ALL") {
      return comparisonData.midnightMatches.filter((entry: any) =>
        entry.posDate.startsWith(selectedMonth)
      );
    }
    return comparisonData.midnightMatches.filter((entry: any) =>
      entry.posDate === selectedDate
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Comparison Results</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="font-medium text-lg">Select Month:</label>
          <Select value={selectedMonth} onValueChange={(month) => {
            setSelectedMonth(month);
            setSelectedDate("ALL");
          }}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Choose a month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMonth && (
          <div>
            <label className="font-medium text-lg">Select Date:</label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Choose a date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Dates</SelectItem>
                {dateMapByMonth[selectedMonth].map((date) => (
                  <SelectItem key={date} value={date}>{date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedMonth && (
        <div className="space-y-8">
          <Section title="✅ Matched Orders" data={filterByDate(comparisonData.matchedValues)} />
          <Section title="❌ Unmatched in POS" data={filterByDate(comparisonData.unmatchedInPos)} />
          <Section title="❌ Unmatched in Source" data={filterByDate(comparisonData.unmatchedInSource)} />
          <Section title="🤔 Probable Matches" data={filterByDate(comparisonData.probableMatches)} isProbable />
          <Section title="🤔 Combined Probable Matches (Grouped POS)" data={filterByDate(comparisonData.combinedProbableMatches)} isGroupedProbable />
          <Section title="🌙 Midnight Matches" data={filterMidnight()} isMidnight />
        </div>
      )}
    </div>
  );
};

const Section = ({
  title,
  data,
  isProbable = false,
  isGroupedProbable = false,
  isMidnight = false,
}: {
  title: string;
  data: any[];
  isProbable?: boolean;
  isGroupedProbable?: boolean;
  isMidnight?: boolean;
}) => (
  <div>
    <h2 className="text-xl font-semibold mb-2">{title} ({data.length})</h2>
    <div className="bg-white shadow border rounded-md overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {isProbable ? (
              <>
                <th className="p-2">POS Value</th>
                <th className="p-2">Source Value</th>
                <th className="p-2">Date</th>
                <th className="p-2">Difference</th>
              </>
            ) : isGroupedProbable ? (
              <>
                <th className="p-2">POS Values (Grouped)</th>
                <th className="p-2">Source Value</th>
                <th className="p-2">Date</th>
                <th className="p-2">Difference</th>
              </>
            ) : isMidnight ? (
              <>
                <th className="p-2">POS Value</th>
                <th className="p-2">POS Date</th>
                <th className="p-2">Source Value</th>
                <th className="p-2">Source Date</th>
                <th className="p-2">Difference</th>
              </>
            ) : (
              <>
                <th className="p-2">Amount</th>
                <th className="p-2">Date</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((entry, idx) => (
            <tr key={idx} className="border-t">
              {isProbable ? (
                <>
                  <td className="p-2">{entry.posValue}</td>
                  <td className="p-2">{entry.sourceValue}</td>
                  <td className="p-2">{entry.date}</td>
                  <td className="p-2">{entry.difference}</td>
                </>
              ) : isGroupedProbable ? (
                <>
                  <td className="p-2">{entry.posValues.join(", ")}</td>
                  <td className="p-2">{entry.sourceValue}</td>
                  <td className="p-2">{entry.date}</td>
                  <td className="p-2">{entry.difference}</td>
                </>
              ) : isMidnight ? (
                <>
                  <td className="p-2">{entry.posValue}</td>
                  <td className="p-2">{entry.posDate}</td>
                  <td className="p-2">{entry.sourceValue}</td>
                  <td className="p-2">{entry.sourceDate}</td>
                  <td className="p-2">{entry.difference}</td>
                </>
              ) : (
                <>
                  <td className="p-2">{entry.amount}</td>
                  <td className="p-2">{entry.date}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Results;
