const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://cqnkxpezdejfgndrorss.supabase.co', 'sb_publishable_13bJZov-LBpED0biDZ8tCw_WHTjvR0P');

async function test() {
  const { data: services, error } = await supabase
    .from('services')
    .select('*, provider:profiles(id, full_name, bio)')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(services, null, 2));
  }
}

test();
