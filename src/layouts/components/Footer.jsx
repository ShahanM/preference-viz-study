import Button from 'react-bootstrap/Button';

export default function Footer({ callback }) {
	return (
		<div className="layout-footer">
			<Button variant="ers" size="lg" className="layout-footer-btn"
				onClick={callback}>
				Next
			</Button>
		</div>
	)
}