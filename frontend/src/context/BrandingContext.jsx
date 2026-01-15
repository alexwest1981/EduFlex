import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const BrandingContext = createContext();

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
};

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    brandName: 'EduFlex',
    logoUrl: null,
    faviconUrl: null,
    loginBackgroundUrl: null,
    customTheme: null,
    defaultThemeId: 'default',
    footerText: 'Powered by EduFlex',
    welcomeMessage: null,
    showPoweredBy: true,
    enforceOrgTheme: false,
    customEmailTemplates: false,
    customCss: null,
  });

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Load organization branding on mount
  useEffect(() => {
    loadBranding();
    checkAccess();
  }, []);

  const loadBranding = async () => {
    try {
      const data = await api.branding.get();
      if (data) {
        setBranding(data);

        // Apply favicon if set
        if (data.faviconUrl) {
          updateFavicon(data.faviconUrl);
        }

        // Apply custom CSS if set
        if (data.customCss) {
          injectCustomCSS(data.customCss);
        }

        // Update document title with brand name
        if (data.brandName) {
          document.title = data.brandName;
        }
      }
    } catch (error) {
      console.error('Failed to load branding:', error);
      // Keep default branding on error
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async () => {
    try {
      const data = await api.branding.checkAccess();
      setHasAccess(data?.hasAccess || false);
    } catch (error) {
      // User might not be admin or not logged in
      setHasAccess(false);
    }
  };

  const updateBranding = async (updates) => {
    try {
      console.log('Updating branding with:', updates);
      const data = await api.branding.update(updates);
      console.log('Backend returned branding:', data);
      setBranding(data);

      // Re-apply dynamic elements
      if (data.faviconUrl) {
        updateFavicon(data.faviconUrl);
      }
      if (data.customCss) {
        injectCustomCSS(data.customCss);
      }
      if (data.brandName) {
        document.title = data.brandName;
      }

      return data;
    } catch (error) {
      console.error('Failed to update branding:', error);
      throw error;
    }
  };

  const uploadLogo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await api.branding.uploadLogo(formData);
      setBranding(data);
      return data;
    } catch (error) {
      console.error('Failed to upload logo:', error);
      throw error;
    }
  };

  const uploadFavicon = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await api.branding.uploadFavicon(formData);
      setBranding(data);

      // Update favicon in DOM
      if (data.faviconUrl) {
        updateFavicon(data.faviconUrl);
      }

      return data;
    } catch (error) {
      console.error('Failed to upload favicon:', error);
      throw error;
    }
  };

  const uploadLoginBackground = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await api.branding.uploadLoginBackground(formData);
      setBranding(data);
      return data;
    } catch (error) {
      console.error('Failed to upload login background:', error);
      throw error;
    }
  };

  const resetBranding = async () => {
    try {
      const data = await api.branding.reset();
      setBranding(data);

      // Reset favicon to default
      updateFavicon('/vite.svg');

      // Remove custom CSS
      removeCustomCSS();

      // Reset title
      document.title = 'EduFlex';

      return data;
    } catch (error) {
      console.error('Failed to reset branding:', error);
      throw error;
    }
  };

  // Helper: Update favicon dynamically
  const updateFavicon = (url) => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  };

  // Helper: Inject custom CSS
  const injectCustomCSS = (css) => {
    // Remove existing custom CSS
    const existingStyle = document.getElementById('org-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Inject new CSS
    const style = document.createElement('style');
    style.id = 'org-custom-css';
    style.textContent = css;
    document.head.appendChild(style);
  };

  // Helper: Remove custom CSS
  const removeCustomCSS = () => {
    const existingStyle = document.getElementById('org-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
  };

  // Get parsed custom theme object
  const getCustomTheme = () => {
    if (!branding.customTheme) return null;

    try {
      return JSON.parse(branding.customTheme);
    } catch (error) {
      console.error('Failed to parse custom theme:', error);
      return null;
    }
  };

  const value = {
    branding,
    loading,
    hasAccess,
    loadBranding,
    updateBranding,
    uploadLogo,
    uploadFavicon,
    uploadLoginBackground,
    resetBranding,
    getCustomTheme,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};
