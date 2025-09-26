import clsx from "clsx";
import LoadingText from "../components/LoadingText";
import { useStepCompletion } from "../hooks/useStepCompletion";


export const Footer: React.FC<{ onNextButtonClick: () => void; text?: string; loading?: false }> = ({
	onNextButtonClick,
	text = 'Next',
	loading = false,
}) => {
	const { isStepComplete } = useStepCompletion();
	const disabled = !isStepComplete;
	return (
		<div className=" bg-gray-200 rounded-lg mt-3 content-center p-5">
			<button
				className={clsx(
					'p-3 float-end rounded-md',
					'font-normal',
					disabled
						? 'bg-gray-400 text-gray-500 cursor-not-allowed'
						: 'bg-amber-500 hover:bg-amber-600 text-gray-800 hover:text-gray-100 cursor-pointer'
				)}
				onClick={onNextButtonClick}
				disabled={disabled}
			>
				<span>{!loading ? text : <LoadingText text={'Loading...'} />}</span>
			</button>
		</div>
	);
};

export default Footer;