import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmationDialogProps {
    title: string;
    message: string;
    show: boolean;
    onConfirm?: () => void;
    ConfirmButton?: React.FunctionComponent;
    onCancel?: () => void;
    CancelButton?: React.FunctionComponent;
    cancelText?: string;
    confirmText?: string;
    disableHide?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    title,
    message,
    show,
    onConfirm,
    ConfirmButton = null,
    onCancel,
    CancelButton = null,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    disableHide = false,
}) => {
    /*
     *	Note: confirmButton, and cancelButton override onConfirm, and onCancel respectively.
     */
    return (
        <Modal
            show={show}
            onHide={onCancel}
            backdrop="static"
            keyboard={!disableHide}
            centered
            onEscapeKeyDown={() => {}}
        >
            <Modal.Header className="warning-header-ers" closeButton={false}>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                {ConfirmButton !== null ? (
                    React.createElement(ConfirmButton)
                ) : (
                    <Button variant="ersCancel" onClick={onCancel}>
                        {cancelText}
                    </Button>
                )}
                {CancelButton !== null ? (
                    React.createElement(CancelButton)
                ) : (
                    <Button variant="ers" onClick={onConfirm}>
                        {confirmText}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationDialog;
