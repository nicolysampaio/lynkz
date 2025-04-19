import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as fa from "@fortawesome/free-solid-svg-icons";

interface ButtonProps {
  label: string;
  className?: string;
  route: string;
}

function Button({ label, className = "", route, ...props }: ButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      className={`py-2 px-4 rounded-md flex items-center gap-2 cursor-pointer ${className}`}
      {...props}
      onClick={() => navigate(route)}
    >
      <FontAwesomeIcon
        icon={fa.faRightToBracket}
        style={{ color: "#ffffff" }}
      />
      {label}
    </button>
  );
}

export default Button;
