import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { useState, useEffect } from 'react';

export default function Footer({ callback, disabled = false, text = "Next",
	loading = false }) {

	const [variant, setVariant] = useState("ers");
	useEffect(() => { setVariant(disabled ? "ersDisabled" : "ers") }, [disabled]);

	return (
		<div className="layout-footer">
			<Button variant={variant} size="lg" className="layout-footer-btn"
				onClick={callback}>
				{!loading ? text : <LoadingText />}
			</Button>
		</div>
	)
}

const LoadingText = () => {
	return (
		<>
			<Spinner
				as="span"
				animation="grow"
				size="sm"
				role="status"
				aria-hidden="true"
			/>
			Loading...
		</>
	)
}