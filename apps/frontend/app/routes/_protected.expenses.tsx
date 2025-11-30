import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { api } from "~/lib/api";
import { getAuthTokenFromSession } from "~/lib/session";
import type { User } from "~/lib/auth";
import { ExpenseTracker } from "~/components/ExpenseTracker";

interface LoaderData {
  user: User | null;
  expenses: any[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isDemo = url.searchParams.get('demo') === 'true';

  // In demo mode, return demo data with null user
  if (isDemo) {
    const demoExpenses = [
      {
        id: 1,
        eventName: 'Annual Tech Conference 2024',
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
        eventName: 'Annual Tech Conference 2024',
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
        eventName: 'Annual Tech Conference 2024',
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
      {
        id: 7,
        eventName: 'Annual Tech Conference 2024',
        category: 'Catering',
        description: 'Breakfast & Lunch Service',
        vendor: 'Premium Catering Co.',
        amount: 24000,
        date: '2024-02-18',
        submittedBy: 'Emily Chen',
        status: 'approved',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-02-19',
      },
      {
        id: 8,
        eventName: 'Annual Gala',
        category: 'Venue',
        description: 'Ballroom Rental',
        vendor: 'Grand Ballroom',
        amount: 25000,
        date: '2024-02-20',
        submittedBy: 'Robert Wilson',
        status: 'approved',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-02-21',
      },
      {
        id: 9,
        eventName: 'Industry Summit',
        category: 'Technology',
        description: 'AV Equipment & Setup',
        vendor: 'Tech Events Pro',
        amount: 10500,
        date: '2024-02-22',
        submittedBy: 'James Taylor',
        status: 'approved',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-02-23',
      },
      {
        id: 10,
        eventName: 'Annual Tech Conference 2024',
        category: 'Entertainment',
        description: 'Keynote Speaker Fee',
        vendor: 'Speaker Bureau Inc.',
        amount: 20000,
        date: '2024-02-25',
        submittedBy: 'Mike Davis',
        status: 'approved',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-02-26',
      },
      {
        id: 11,
        eventName: 'Training Seminar',
        category: 'Venue',
        description: 'Training Center Rental',
        vendor: 'Training Center',
        amount: 8000,
        date: '2024-02-28',
        submittedBy: 'Michael Brown',
        status: 'pending',
      },
      {
        id: 12,
        eventName: 'Client Appreciation Dinner',
        category: 'Catering',
        description: 'Fine Dining Service',
        vendor: 'Fine Dining Restaurant',
        amount: 15000,
        date: '2024-03-01',
        submittedBy: 'Jennifer Lee',
        status: 'approved',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-03-02',
      },
      {
        id: 13,
        eventName: 'Charity Fundraiser',
        category: 'Marketing',
        description: 'Event Promotion Campaign',
        vendor: 'Marketing Agency',
        amount: 8000,
        date: '2024-03-05',
        submittedBy: 'Patricia Garcia',
        status: 'pending',
      },
      {
        id: 14,
        eventName: 'Annual Tech Conference 2024',
        category: 'Staffing',
        description: 'Event Staff Services',
        vendor: 'EventStaff Plus',
        amount: 7200,
        date: '2024-03-08',
        submittedBy: 'Amanda Lee',
        status: 'approved',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-03-09',
      },
      {
        id: 15,
        eventName: 'Summer Networking Mixer',
        category: 'Venue',
        description: 'Beachfront Hotel Rental',
        vendor: 'Beachfront Hotel',
        amount: 5000,
        date: '2024-03-10',
        submittedBy: 'David Martinez',
        status: 'pending',
      },
      {
        id: 16,
        eventName: 'Industry Summit',
        category: 'Transportation',
        description: 'Shuttle Service',
        vendor: 'Transport Co',
        amount: 4800,
        date: '2024-03-12',
        submittedBy: 'James Taylor',
        status: 'approved',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-03-13',
      },
      {
        id: 17,
        eventName: 'Annual Gala',
        category: 'Photography',
        description: 'Event Photography & Videography',
        vendor: 'Photo Pro',
        amount: 6000,
        date: '2024-03-15',
        submittedBy: 'Robert Wilson',
        status: 'approved',
        approvedBy: 'Sarah Johnson',
        approvalDate: '2024-03-16',
      },
      {
        id: 18,
        eventName: 'Product Launch Event',
        category: 'Technology',
        description: 'Event App Development',
        vendor: 'App Developers',
        amount: 12000,
        date: '2024-03-18',
        submittedBy: 'John Smith',
        status: 'pending',
      },
    ];

    return json<LoaderData>({ user: null as any, expenses: demoExpenses });
  }

  // Otherwise, require authentication
  const user = await requireAuth(request);
  const token = await getAuthTokenFromSession(request);

  try {
    const expenses = await api.get<any[]>("/expenses", {
      token: token || undefined,
    });
    return json<LoaderData>({ user, expenses: expenses || [] });
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    return json<LoaderData>({ user, expenses: [] });
  }
}

export default function ExpensesRoute() {
  const { user, expenses } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  return <ExpenseTracker user={user} organization={undefined} event={undefined} isDemo={isDemo} />;
}

