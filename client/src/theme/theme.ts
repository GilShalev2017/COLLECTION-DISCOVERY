export const CSS_VARIABLES_DARK = `
  :root {
    --gold:        #C9A84C;
    --gold-light:  #E8D08A;
    --gold-dim:    rgba(201,168,76,0.15);
    --gold-glow:   rgba(201,168,76,0.35);
    --bg:          #080808;
    --surface:     #111111;
    --surface2:    #181818;
    --surface3:    #202020;
    --border:      rgba(255,255,255,0.07);
    --border-gold: rgba(201,168,76,0.25);
    --text:        #F2EDE4;
    --text-dim:    #7A7570;
    --text-mid:    #A89F96;
    --crimson:     #8B1A1A;
    --emerald:     #1A5C3A;
    --sapphire:    #1A2E5C;
    --radius:      14px;
    --font-display: 'Cormorant Garamond', serif;
    --font-ui:      'DM Sans', sans-serif;
  }
`;

//Claude AI
export const CSS_VARIABLES_LIGHT = `
  :root {
    --gold:        #9B7133;
    --gold-light:  #C9A84C;
    --gold-dim:    rgba(155,113,51,0.12);
    --gold-glow:   rgba(155,113,51,0.25);
    --bg:          #FAF8F3;
    --surface:     #FFFFFF;
    --surface2:    #F5F2ED;
    --surface3:    #EDE9E1;
    --border:      rgba(155,113,51,0.15);
    --border-gold: rgba(155,113,51,0.35);
    --text:        #1A1614;
    --text-dim:    #6B5F56;
    --text-mid:    #4A4038;
    --crimson:     #B8392E;
    --emerald:     #2D7A52;
    --sapphire:    #3D5A8C;
    --radius:      14px;
    --font-display: 'Cormorant Garamond', serif;
    --font-ui:      'DM Sans', sans-serif;
  }

  body {
    background: linear-gradient(135deg, #FAF8F3 0%, #F5EFE6 100%);
  }
`;

export const ANIMATIONS = `
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes shimmer {
    0%  {background-position:-200% 0}
    100%{background-position: 200% 0}
  }

  .fade-in  { animation: fadeIn  0.5s ease forwards; }
  .slide-up { animation: slideUp 0.5s cubic-bezier(.16,1,.3,1) forwards; }
  .shimmer  {
    background: linear-gradient(90deg, var(--surface2) 25%, var(--surface3) 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`;

// Combined — this is what you inject into App.tsx

export const GLOBAL_STYLES_DARK = CSS_VARIABLES_DARK + ANIMATIONS;
export const GLOBAL_STYLES_LIGHT = CSS_VARIABLES_LIGHT + ANIMATIONS;