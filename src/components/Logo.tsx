import flowdeskLogo from "@/assets/flowdesk-logo.png";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "h-8" }: LogoProps) => {
  return <img src={flowdeskLogo} alt="FlowDesk" className={className} />;
};
