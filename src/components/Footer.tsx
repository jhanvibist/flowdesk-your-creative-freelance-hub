import { Logo } from "./Logo";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="relative border-t border-border/40 bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2">
            <Logo className="h-16 mb-4 -ml-2" />
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Keep your work flowing. Get paid without the chaos. The smart invoice and payment tracker for freelancers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-smooth">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-smooth">Pricing</a></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-smooth">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-smooth">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-smooth">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition-smooth">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} FlowDesk. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Made for freelancers who flow.</p>
        </div>
      </div>
    </footer>
  );
};
