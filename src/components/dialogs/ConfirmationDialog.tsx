import {Modal, Button} from 'react-bootstrap';


interface ConfirmationDialogProps{
	title: string;
	message: string;
	show: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	title,
	message,
	show,
	onConfirm,
	onCancel
}) => {

	return (
		<Modal show={show} onHide={onCancel}>
			<Modal.Header className="warning-header-ers" closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>{message}</Modal.Body>
			<Modal.Footer>
				<Button variant="ersCancel" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="ers" onClick={onConfirm}>
					Confirm
				</Button>
			</Modal.Footer>
		</Modal>
	)

}

export default ConfirmationDialog;