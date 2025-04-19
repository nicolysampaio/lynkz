import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as fa from "@fortawesome/free-solid-svg-icons";

interface ButtonProps {
  label: string;
  className?: string;
  route?: string;
  icon?: fa.IconDefinition;
  onClick?: () => void;
}

function Button({ label, className = "", route, icon = fa.faRightToBracket, onClick, ...props }: ButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (route) {
      navigate(route);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer ${className}`}
      onClick={handleClick}
      {...props}
    >
      <FontAwesomeIcon icon={icon} style={{ color: "#ffffff" }} />
      {label}
    </button>
  );
}

export default Button;
