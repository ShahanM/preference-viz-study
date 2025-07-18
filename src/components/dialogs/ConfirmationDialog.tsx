import {Modal, Button} from 'react-bootstrap';


interface ConfirmationDialogProps{
	title: string;
	message: string;
	show: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	cancelText?: string;
	confirmText?: string;
	disableHide?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	title,
	message,
	show,
	onConfirm,
	onCancel,
	cancelText = "Cancel",
	confirmText = "Confirm",
	disableHide = false
}) => {

	return (
		<Modal show={show} onHide={onCancel} backdrop="static" keyboard={!disableHide} centered onEscapeKeyDown={() => {}}>
			<Modal.Header className="warning-header-ers" closeButton={false}>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>{message}</Modal.Body>
			<Modal.Footer>
				<Button variant="ersCancel" onClick={onCancel}>
					{cancelText}
				</Button>
				<Button variant="ers" onClick={onConfirm}>
					{confirmText}
				</Button>
			</Modal.Footer>
		</Modal>
	)

}

export default ConfirmationDialog;