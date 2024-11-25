import { useRouter } from "next/router";
import { useEffect } from "react";

const withAuth = (WrappedComponent: React.ComponentType, allowedRoles: string[]) => {
  return (props: any) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token"); 
      const role = localStorage.getItem("role"); 

      if (!token || !allowedRoles.includes(role || "")) {
        router.replace("/login"); 
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
