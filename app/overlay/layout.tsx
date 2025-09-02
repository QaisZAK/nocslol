import './globals.css'

export default function OverlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Stream Overlay</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
            }
            
            html, body, #__next, #__next > div, #__next > div > div {
              margin: 0 !important;
              padding: 0 !important;
              background: transparent !important;
              overflow: hidden !important;
              width: 100% !important;
              height: 100% !important;
              position: relative !important;
            }
            
            body {
              font-family: Inter, sans-serif !important;
            }
            
            /* Hide any navigation or other elements */
            nav, header, footer, .navigation, .navbar, [data-testid="navigation"], 
            .min-h-screen, .bg-lol-dark, .max-w-7xl, .mx-auto, .px-4 {
              display: none !important;
            }
            
            /* Show only overlay content */
            .overlay-content {
              display: block !important;
              position: relative !important;
              z-index: 9999 !important;
              margin: 0 !important;
              padding: 0 !important;
              background: transparent !important;
              width: 100% !important;
              height: 100% !important;
            }
            
            /* Hide any wrapper divs that might contain navigation */
            div:not(.overlay-content) {
              display: none !important;
            }
            
            .overlay-content, .overlay-content * {
              display: block !important;
            }
          `
        }} />
      </head>
      <body className="bg-transparent m-0 p-0 overflow-hidden">
        <div className="overlay-content" style={{ 
          margin: 0, 
          padding: 0, 
          background: 'transparent',
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 9999,
          display: 'block'
        }}>
          {children}
        </div>
      </body>
    </html>
  )
}
