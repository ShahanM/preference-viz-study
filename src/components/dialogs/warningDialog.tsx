import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface WarningDialogProps {
    show: boolean;
    title: string;
    message: string;
    onClose: (show: boolean) => void;
    confirmCallback?: () => void;
    confirmText?: string;
    cancelCallback?: () => void;
    disableHide?: boolean;
}
export const WarningDialog: React.FC<WarningDialogProps> = ({
    show,
    title,
    message,
    onClose,
    disableHide = false,
    confirmCallback,
    confirmText = 'Confirm',
    cancelCallback,
}) => {
    const handleClose = () => !disableHide && onClose(false);

    const htmlparser = (html: string) => {
        const clean = DOMPurify.sanitize(html);
        const parsed = parse(clean);
        return parsed;
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header className="warning-header-ers" closeButton={false}>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{htmlparser(message)}</Modal.Body>
                {!disableHide && (
                    <Modal.Footer>
                        {cancelCallback && (
                            <Button variant="ersCancel" onClick={cancelCallback}>
                                Close
                            </Button>
                        )}
                        <Button variant="ers" onClick={confirmCallback ? confirmCallback : handleClose}>
                            {confirmText}
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>
        </>
    );
};
