import DOMPurify from "dompurify";
import parse from "html-react-parser";

export default function Header(props) {

	const clean = DOMPurify.sanitize(props.content);
	const parsed = parse(clean);

	return (
		<div className="layout-header">
			<h1>{props.title}</h1>
			<div className="layout-header-text">
				{parsed}
			</div>
		</div>
	)
}