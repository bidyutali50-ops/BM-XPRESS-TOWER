import "./globals.css";

export const metadata={title:"BM XPRESS Control Tower",description:"Live logistics operations"};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>;
}
