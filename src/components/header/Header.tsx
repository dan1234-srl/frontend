import Navbar from "./Navbar";

/**
 * Header is now just a thin wrapper around Navbar.
 * Navbar self-contains all overlays (login, cart, search, wishlist).
 */
const Header = () => <Navbar />;

export default Header;
