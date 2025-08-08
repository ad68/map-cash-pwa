import { Link } from "react-router-dom";
export default function Index() {
    return <section style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
        <Link to="/map-cash">
            Map Cash
        </Link>
    </section>
}
