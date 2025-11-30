import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken || accessToken === 'undefined') {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log('Auth error:', error);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
};

// ========== ORGANIZATIONS ==========

app.post('/make-server-3dd0a4ac/organizations', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const organization = {
      id: crypto.randomUUID(),
      name: body.name,
      industry: body.industry,
      size: body.size,
      address: body.address,
      city: body.city,
      country: body.country,
      website: body.website,
      description: body.description,
      adminId: userId,
      subscription: body.subscription || 'free',
      eventsLimit: body.subscription === 'free' ? 1 : body.subscription === 'professional' ? -1 : -1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`org:${organization.id}`, organization);
    await kv.set(`user:${userId}:org`, organization.id);

    // Create admin membership
    const membership = {
      id: crypto.randomUUID(),
      organizationId: organization.id,
      userId: userId,
      role: 'admin',
      joinedAt: new Date().toISOString(),
    };
    await kv.set(`membership:${membership.id}`, membership);
    await kv.set(`org:${organization.id}:member:${userId}`, membership);

    return c.json({ organization, membership });
  } catch (error: any) {
    console.error('Error creating organization:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3dd0a4ac/organizations/:id', requireAuth, async (c) => {
  try {
    const orgId = c.req.param('id');
    const organization = await kv.get(`org:${orgId}`);
    
    if (!organization) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    return c.json({ organization });
  } catch (error: any) {
    console.error('Error fetching organization:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3dd0a4ac/organizations/:id/members', requireAuth, async (c) => {
  try {
    const orgId = c.req.param('id');
    const memberships = await kv.getByPrefix(`org:${orgId}:member:`);
    
    return c.json({ members: memberships });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========== EVENTS ==========

app.post('/make-server-3dd0a4ac/events', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const event = {
      id: crypto.randomUUID(),
      name: body.name,
      type: body.type,
      date: body.date,
      endDate: body.endDate,
      location: body.location,
      venue: body.venue,
      attendees: body.attendees,
      budget: body.budget,
      description: body.description,
      status: body.status || 'planning',
      organizationId: body.organizationId,
      createdBy: userId,
      assignedTo: body.assignedTo || userId,
      spent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`event:${event.id}`, event);
    
    if (body.organizationId) {
      await kv.set(`org:${body.organizationId}:event:${event.id}`, event.id);
    } else {
      await kv.set(`user:${userId}:event:${event.id}`, event.id);
    }

    return c.json({ event });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3dd0a4ac/events', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const orgId = c.req.query('organizationId');
    
    let eventIds: any[] = [];
    
    if (orgId) {
      eventIds = await kv.getByPrefix(`org:${orgId}:event:`);
    } else {
      eventIds = await kv.getByPrefix(`user:${userId}:event:`);
    }

    const events = await Promise.all(
      eventIds.map(async (id) => {
        const eventId = typeof id === 'string' ? id : id;
        return await kv.get(`event:${eventId}`);
      })
    );

    return c.json({ events: events.filter(e => e !== null) });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3dd0a4ac/events/:id', requireAuth, async (c) => {
  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    return c.json({ event });
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-3dd0a4ac/events/:id', requireAuth, async (c) => {
  try {
    const eventId = c.req.param('id');
    const body = await c.req.json();
    const existingEvent = await kv.get(`event:${eventId}`);
    
    if (!existingEvent) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const updatedEvent = {
      ...existingEvent,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`event:${eventId}`, updatedEvent);
    return c.json({ event: updatedEvent });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/make-server-3dd0a4ac/events/:id', requireAuth, async (c) => {
  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    await kv.del(`event:${eventId}`);
    
    if (event.organizationId) {
      await kv.del(`org:${event.organizationId}:event:${eventId}`);
    } else {
      await kv.del(`user:${event.createdBy}:event:${eventId}`);
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========== BUDGETS ==========

app.post('/make-server-3dd0a4ac/budgets', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const budget = {
      id: crypto.randomUUID(),
      eventId: body.eventId,
      version: body.version || 1,
      name: body.name || 'Initial Budget',
      status: body.status || 'draft',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`budget:${budget.id}`, budget);
    await kv.set(`event:${body.eventId}:budget:${budget.id}`, budget.id);

    return c.json({ budget });
  } catch (error: any) {
    console.error('Error creating budget:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3dd0a4ac/events/:eventId/budgets', requireAuth, async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const budgetIds = await kv.getByPrefix(`event:${eventId}:budget:`);
    
    const budgets = await Promise.all(
      budgetIds.map(async (id) => {
        const budgetId = typeof id === 'string' ? id : id;
        return await kv.get(`budget:${budgetId}`);
      })
    );

    return c.json({ budgets: budgets.filter(b => b !== null) });
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========== BUDGET LINE ITEMS ==========

app.post('/make-server-3dd0a4ac/budget-lines', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const budgetLine = {
      id: crypto.randomUUID(),
      budgetId: body.budgetId,
      category: body.category,
      item: body.item,
      allocated: body.allocated,
      spent: body.spent || 0,
      status: body.status || 'pending',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`budgetline:${budgetLine.id}`, budgetLine);
    await kv.set(`budget:${body.budgetId}:line:${budgetLine.id}`, budgetLine.id);

    return c.json({ budgetLine });
  } catch (error: any) {
    console.error('Error creating budget line:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3dd0a4ac/budgets/:budgetId/lines', requireAuth, async (c) => {
  try {
    const budgetId = c.req.param('budgetId');
    const lineIds = await kv.getByPrefix(`budget:${budgetId}:line:`);
    
    const lines = await Promise.all(
      lineIds.map(async (id) => {
        const lineId = typeof id === 'string' ? id : id;
        return await kv.get(`budgetline:${lineId}`);
      })
    );

    return c.json({ budgetLines: lines.filter(l => l !== null) });
  } catch (error: any) {
    console.error('Error fetching budget lines:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========== EXPENSES ==========

app.post('/make-server-3dd0a4ac/expenses', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const expense = {
      id: crypto.randomUUID(),
      eventId: body.eventId,
      category: body.category,
      item: body.item,
      amount: body.amount,
      vendor: body.vendor,
      date: body.date,
      notes: body.notes,
      status: body.status || 'pending',
      submittedBy: userId,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`expense:${expense.id}`, expense);
    await kv.set(`event:${body.eventId}:expense:${expense.id}`, expense.id);

    return c.json({ expense });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3dd0a4ac/events/:eventId/expenses', requireAuth, async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const expenseIds = await kv.getByPrefix(`event:${eventId}:expense:`);
    
    const expenses = await Promise.all(
      expenseIds.map(async (id) => {
        const expenseId = typeof id === 'string' ? id : id;
        return await kv.get(`expense:${expenseId}`);
      })
    );

    return c.json({ expenses: expenses.filter(e => e !== null) });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-3dd0a4ac/expenses/:id/approve', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const expenseId = c.req.param('id');
    const expense = await kv.get(`expense:${expenseId}`);
    
    if (!expense) {
      return c.json({ error: 'Expense not found' }, 404);
    }

    const updatedExpense = {
      ...expense,
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`expense:${expenseId}`, updatedExpense);
    return c.json({ expense: updatedExpense });
  } catch (error: any) {
    console.error('Error approving expense:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-3dd0a4ac/expenses/:id/reject', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const expenseId = c.req.param('id');
    const body = await c.req.json();
    const expense = await kv.get(`expense:${expenseId}`);
    
    if (!expense) {
      return c.json({ error: 'Expense not found' }, 404);
    }

    const updatedExpense = {
      ...expense,
      status: 'rejected',
      rejectedBy: userId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: body.reason || '',
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`expense:${expenseId}`, updatedExpense);
    return c.json({ expense: updatedExpense });
  } catch (error: any) {
    console.error('Error rejecting expense:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========== VENDORS ==========

app.post('/make-server-3dd0a4ac/vendors', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const vendor = {
      id: crypto.randomUUID(),
      name: body.name,
      category: body.category,
      email: body.email,
      phone: body.phone,
      address: body.address,
      rating: body.rating || 0,
      notes: body.notes,
      organizationId: body.organizationId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`vendor:${vendor.id}`, vendor);
    
    if (body.organizationId) {
      await kv.set(`org:${body.organizationId}:vendor:${vendor.id}`, vendor.id);
    } else {
      await kv.set(`user:${userId}:vendor:${vendor.id}`, vendor.id);
    }

    return c.json({ vendor });
  } catch (error: any) {
    console.error('Error creating vendor:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.get('/make-server-3dd0a4ac/vendors', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const orgId = c.req.query('organizationId');
    
    let vendorIds: any[] = [];
    
    if (orgId) {
      vendorIds = await kv.getByPrefix(`org:${orgId}:vendor:`);
    } else {
      vendorIds = await kv.getByPrefix(`user:${userId}:vendor:`);
    }

    const vendors = await Promise.all(
      vendorIds.map(async (id) => {
        const vendorId = typeof id === 'string' ? id : id;
        return await kv.get(`vendor:${vendorId}`);
      })
    );

    return c.json({ vendors: vendors.filter(v => v !== null) });
  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ========== USER PROFILE ==========

app.get('/make-server-3dd0a4ac/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    
    // Get user profile from KV store
    let profile = await kv.get(`user:${userId}:profile`);
    
    if (!profile) {
      // Create default profile
      profile = {
        id: userId,
        email: userEmail,
        subscription: 'free',
        freeEventsRemaining: 1,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`user:${userId}:profile`, profile);
    }

    // Get user's organization if any
    const orgId = await kv.get(`user:${userId}:org`);
    let organization = null;
    
    if (orgId) {
      organization = await kv.get(`org:${orgId}`);
    }

    return c.json({ profile, organization });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.put('/make-server-3dd0a4ac/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const existingProfile = await kv.get(`user:${userId}:profile`) || {};
    
    const updatedProfile = {
      ...existingProfile,
      ...body,
      id: userId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}:profile`, updatedProfile);
    return c.json({ profile: updatedProfile });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Health check
app.get('/make-server-3dd0a4ac/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
