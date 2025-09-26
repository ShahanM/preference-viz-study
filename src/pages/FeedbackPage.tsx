import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import React, { useCallback, useRef, useState } from "react";
import { useStudy } from "rssa-api";
import { useStepCompletion } from "../hooks/useStepCompletion";


export type Feedback = {
	feedback_text: string;
	feedback_type: string;
	feedback_category: string;
};


const FeedbackPage: React.FC = () => {
	const { setIsStepComplete } = useStepCompletion();
	const { studyApi } = useStudy();

	const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);
	const feedbackRef = useRef<HTMLTextAreaElement>(null);

	const feedbackMutation = useMutation({
		mutationKey: ['Feedback'],
		mutationFn: async (feedbackPayload: Feedback) => studyApi.patch<Feedback>('feedbacks/', feedbackPayload),
		onSuccess: () => {
			setIsStepComplete(true);
		},
		onError: () => { }

	});

	const handleFeedbackSubmit = useCallback(() => {
		if (feedbackRef.current) {
			const feedbackText = feedbackRef.current.value;
			if (feedbackText.length === 0) {
				setShowConfirmationDialog(true);
				return;
			}
			const feedbackPayload = {
				feedback_text: feedbackText,
				feedback_type: 'post-intervention-debrief',
				feedback_category: 'system',
			}
			feedbackMutation.mutateAsync(feedbackPayload);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [feedbackMutation.mutateAsync]);

	return (
		<div className="w-full">
			{/* {showWarning && <WarningDialog show={showWarning} confirmCallback={handleWarningConfirm}
					title="Empty feedback" message="<p>You hardly wrote anything.</p><p>Are you sure you are done?</p>"
					confirmText="Yes, I'm done"
				/>} */}
			<div className="w-1/3 text-left mx-auto">
				<label htmlFor='feedbackInput'>
					<p className="mt-5">Thank you for participating in our study!</p>
					<p className="mt-3">
						Tell us about your experience with the study. This is a research study and your feedback is not
						only important to us, but also greatly appreciated.
					</p>
					<p className="mt-3">
						You can include any suggestions, or your thoughts on the system that you interacted with. Your
						feedback will help future studies and also the design of real world systems.
					</p>
				</label>
				<textarea
					title={'Feedback input textarea'}
					placeholder="Please include as much detail as you can."
					name='feedbackInput'
					ref={feedbackRef}
					rows={6}
					className={clsx(
						"rounded-md",
						'p-3 mt-5',
						'block w-full rounded-md border-amber-400',
						'shadow-sm focus:border-yellow-500 focus:ring-yellow-500',
						'sm:text-sm font-mono'
					)}
				/>
			</div>
			<button className="m-5 p-3 bg-amber-500 rounded-md hover:bg-amber-600 cursor-pointer"
				onClick={handleFeedbackSubmit}>
				Submit Feedback
			</button>
		</div>
	);
}

export default FeedbackPage;