import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

interface WarningDialogProps {
    show: boolean;
    title: string;
    message: string;
    confirmCallback?: () => void;
    confirmText?: string;
    cancelCallback?: () => void;
    disableHide?: boolean;
    onClose?: (open: boolean) => void;
}

export const WarningDialog: React.FC<WarningDialogProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleClose = () => !props.disableHide && setIsOpen(false);

    const htmlparser = (html: string) => {
        const clean = DOMPurify.sanitize(html);
        const parsed = parse(clean as string);
        return parsed;
    };

    useEffect(() => {
        setIsOpen(props.show);
    }, [props.show]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    {props.title}
                                </Dialog.Title>
                                <div className="mt-2">
                                    <div className="text-sm text-gray-500">{htmlparser(props.message)}</div>
                                </div>

                                {!props.disableHide && (
                                    <div className="mt-4 flex justify-end gap-2">
                                        {props.cancelCallback && (
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                                onClick={() => props.cancelCallback?.()}
                                            >
                                                Close
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                                            onClick={
                                                props.confirmCallback ? () => props.confirmCallback?.() : handleClose
                                            }
                                        >
                                            {props.confirmText || 'Confirm'}
                                        </button>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
