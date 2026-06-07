(() => {
  const missingMessage = 'Chưa cấu hình Supabase. Vui lòng kiểm tra supabase-config.js.';

  const getConfigValue = (key) => {
    try {
      return typeof window[key] === 'string' ? window[key].trim() : '';
    } catch (error) {
      return '';
    }
  };

  const url = getConfigValue('SUPABASE_URL');
  const anonKey = getConfigValue('SUPABASE_ANON_KEY');
  const hasPlaceholders = [url, anonKey].some((value) => value.includes('YOUR_SUPABASE'));
  const hasBrowserSdk = Boolean(window.supabase?.createClient);
  const isConfigured = Boolean(url && anonKey && !hasPlaceholders && hasBrowserSdk);

  let client = null;
  let initError = null;

  if (isConfigured) {
    try {
      client = window.supabase.createClient(url, anonKey, {
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
  } else if (url || anonKey) {
    console.warn(missingMessage);
  }

  window.AnhMinhSupabase = {
    client,
    isConfigured: Boolean(client),
    missingMessage,
    initError,
    bucketName: 'product-images',
  };
})();
