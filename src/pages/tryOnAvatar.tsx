import { Button } from "@/components/ui/button";
import { Navigate, useNavigate } from "react-router-dom";

const TryOnAvatar = () => {

    const navigate = useNavigate();

    return <div className="h-full w-full flex items-center justify-center">
        <Button 
        className="bg-blue-500 text-white"
        onClick={() => navigate('/avatar-canvas')}>Try On Avatar</Button>
    </div>;
};

export default TryOnAvatar;

