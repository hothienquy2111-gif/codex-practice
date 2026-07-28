(() => {
  const missingMessage = 'Chưa cấu hình Supabase. Vui lòng kiểm tra supabase-config.js.';

  const cleanConfigValue = (value) => (typeof value === 'string' ? value.trim() : '');
  const supabaseUrl = cleanConfigValue(
    window.SUPABASE_URL || (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '')
  );
  const supabaseKey = cleanConfigValue(
    window.SUPABASE_ANON_KEY || (typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : '')
  );

  const getProjectRef = (urlValue = '') => {
    try {
      const hostname = new URL(urlValue).hostname.toLowerCase();
      const match = hostname.match(/^([a-z0-9]+)\.supabase\.co$/);
      return match?.[1] || '';
    } catch {
      return '';
    }
  };

  const removeLegacyAuthStorage = () => {
    const projectRef = getProjectRef(supabaseUrl);
    if (!projectRef) return;

    const escapedRef = projectRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const legacyKeyPattern = new RegExp(`^sb-${escapedRef}-auth-token(?:\\.\\d+)?$`);

    ['localStorage', 'sessionStorage'].forEach((storageName) => {
      try {
        const storage = window[storageName];
        const keysToRemove = [];
        for (let index = 0; index < storage.length; index += 1) {
          const key = storage.key(index);
          if (key && legacyKeyPattern.test(key)) keysToRemove.push(key);
        }
        keysToRemove.forEach((key) => storage.removeItem(key));
      } catch {
        // Storage can be unavailable in privacy-restricted browser contexts.
      }
    });
  };

  removeLegacyAuthStorage();

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
          persistSession: false,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });
    } catch {
      initError = new Error('ADMIN_SUPABASE_CLIENT_INIT_FAILED');
      console.warn('Không thể khởi tạo Supabase cho trang quản trị.');
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
