import clsx from 'clsx';

export const Footer: React.FC = () => {
    return (
        <footer
            className={clsx(
                'bottom-0 w-full h-5 mt-3 bg-gray-200',
                'content-center p-5 text-gray-400 text-left text-xs'
            )}
        >
            <p className="">
                <i>Recommender systems for self actualization</i>
                <span>, Clemson University, Clemson, South Carolina</span>
            </p>
        </footer>
    );
};

export default Footer;
