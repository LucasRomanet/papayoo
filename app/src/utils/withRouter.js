import { useNavigate, useLocation, useParams } from "react-router-dom";

// React 16+ Router <redirect> workaround
// https://reactrouter.com/en/6.6.1/start/faq#what-happened-to-withrouter-i-need-it

function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        return (
            <Component
            {...props}
            router={{ location, navigate, params }}
            />
        );
    }
    
    return ComponentWithRouterProp;
}

export default withRouter;