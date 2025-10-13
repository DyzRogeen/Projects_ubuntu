import "./layout.css"
import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <div id="navbar-banner">
            <h1 id="title">My Admin Station</h1>
            <div id="menu-banner">
                <h3 className="menu-elem"><Link to="/">Home</Link></h3>
                <h3 className="menu-elem"><Link to="/system">System</Link></h3>
                <h3 className="menu-elem"><Link to="/stats">Statistics</Link></h3>
                <h3 className="menu-elem"><Link to="/network">Network</Link></h3>
            </div>
        </div>
    )
}
export default Navbar