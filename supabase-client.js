(() => {
  const missingMessage = 'Chưa cấu hình Supabase. Vui lòng kiểm tra supabase-config.js.';

  const cleanConfigValue = (value) => (typeof value === 'string' ? value.trim() : '');

  const supabaseUrl = cleanConfigValue(
    window.SUPABASE_URL || (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '')
  );
  const supabaseKey = cleanConfigValue(
    window.SUPABASE_ANON_KEY || (typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : '')
  );

  const hasPlaceholders = [supabaseUrl, supabaseKey].some((value) => value.includes('YOUR_SUPABASE'));
  const hasBrowserSdk = Boolean(window.supabase?.createClient);

  let client = null;
  let initError = null;

  if (!supabaseUrl || !supabaseKey || hasPlaceholders) {
    console.warn(missingMessage);
  } else if (!hasBrowserSdk) {
    console.warn('Chưa tải Supabase JS CDN. Vui lòng kiểm tra thứ tự script trong admin.html.');
  } else {
    try {
      client = window.supabase.createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (error) {
      initError = error;
      console.warn('Không thể khởi tạo Supabase.', error);
    }
  }

  const state = {
    client,
    isConfigured: Boolean(client),
    isReady: true,
    missingMessage,
    initError,
    bucketName: 'product-images',
  };

  window.anhMinhSupabase = state;
  window.AnhMinhSupabase = state;
})();
