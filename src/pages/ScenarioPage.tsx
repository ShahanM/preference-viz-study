import { useEffect } from 'react';
import { useStepCompletion } from '../hooks/useStepCompletion';

const ScenarioPage: React.FC = () => {
    const { setIsStepComplete } = useStepCompletion();
    useEffect(() => {
        setIsStepComplete(false);
        const timerId = setTimeout(() => {
            setIsStepComplete(true);
        }, 3000);
        return () => {
            clearTimeout(timerId);
        };
    }, [setIsStepComplete]);
    return (
        <div className="p-5 m-3 text-left">
            <h3 className="font-medium">Your task</h3>
            <p className="mt-3">
                Imagine you are in a movie critiquing class. One of your assignments is to reflect on your movie
                preferences and write an essay about your movie preferences and what you learned through reflecting
                on your movie preferences. The task of this study is to write personal reflection notes to help you
                write the essay. You will use a
                <span className="ms-1 me-1 font-bold">“preference visualization system”</span>
                to help you reflect on your movie preferences; the tool visualizes your movie preferences and
                juxtaposes them against people who are similar to you.
            </p>
            <h4 className="mt-3 font-medium">Why should I care about understanding and developing my preferences?</h4>
            <p className="mt-3">
                We usually have a baseline understanding of movies that we like and dislike. Our movie-watching
                behavior tends to be motivated by our movie likes and dislikes. However, it is likely that we are
                yet to realize the nuances and the range of our movie preferences.
            </p>
            <p className="mt-3">
                Understanding your preferences can help you learn about the nuances of your movie preferences. It
                can also help you learn about the range of your movie preferences. Furthermore, understanding your
                preferences opens avenues for you to explore new movies that you have not considered before. This
                could help extend your preferences. Alternatively, exploring new movies can help you realize that
                you are not interested and help you refine your likes and dislikes.
            </p>
        </div>
    );
};

export default ScenarioPage;
