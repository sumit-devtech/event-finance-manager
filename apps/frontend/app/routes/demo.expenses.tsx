import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useMatches } from "@remix-run/react";
import { ExpenseTracker } from "~/components/ExpenseTracker";
import type { User } from "~/lib/auth";

/**
 * Demo Expenses Loader - no authentication required
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Demo expenses data from Figma design
  const demoExpenses = [
    {
      id: 1,
      eventName: 'Tech Conference 2024',
      category: 'Venue',
      description: 'Conference Hall Deposit',
      vendor: 'Grand Convention Center',
      amount: 15000,
      date: '2024-02-01',
      submittedBy: 'John Smith',
      status: 'approved',
      approvedBy: 'Sarah Johnson',
      approvalDate: '2024-02-02',
    },
    {
      id: 2,
      eventName: 'Tech Conference 2024',
      category: 'Marketing',
      description: 'Social Media Ads',
      vendor: 'AdTech Solutions',
      amount: 5000,
      date: '2024-02-05',
      submittedBy: 'Mike Davis',
      status: 'pending',
    },
    {
      id: 3,
      eventName: 'Product Launch Event',
      category: 'Catering',
      description: 'Coffee & Snacks Setup',
      vendor: 'Premium Catering Co.',
      amount: 2500,
      date: '2024-02-10',
      submittedBy: 'Emily Chen',
      status: 'approved',
      approvedBy: 'Sarah Johnson',
      approvalDate: '2024-02-11',
    },
    {
      id: 4,
      eventName: 'Annual Gala',
      category: 'Entertainment',
      description: 'Live Band Performance',
      vendor: 'Entertainment Plus',
      amount: 8000,
      date: '2024-02-12',
      submittedBy: 'Robert Wilson',
      status: 'pending',
    },
    {
      id: 5,
      eventName: 'Tech Conference 2024',
      category: 'Technology',
      description: 'Projector Rental',
      vendor: 'Tech Events Pro',
      amount: 1200,
      date: '2024-02-14',
      submittedBy: 'Amanda Lee',
      status: 'rejected',
      approvedBy: 'Sarah Johnson',
      approvalDate: '2024-02-15',
      rejectionReason: 'Already included in venue package',
    },
    {
      id: 6,
      eventName: 'Product Launch Event',
      category: 'Marketing',
      description: 'Press Release Distribution',
      vendor: 'PR Newswire',
      amount: 3500,
      date: '2024-02-16',
      submittedBy: 'John Smith',
      status: 'pending',
    },
  ];

  return json({
    expenses: demoExpenses,
  });
}

export default function DemoExpensesRoute() {
  const { expenses } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const demoLayoutMatch = matches.find(m => m.id === 'routes/demo');
  const user = (demoLayoutMatch?.data as any)?.user as User | undefined;

  if (!user) {
    return <div>Loading...</div>;
  }

  return <ExpenseTracker user={user} expenses={expenses} isDemo={true} />;
}

