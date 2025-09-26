import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useStudy } from 'rssa-api';
import LoadingScreen from '../../components/loadingscreen/LoadingScreen';
import { MovieSelectionProvider } from '../../contexts/movieSelectionContext';
import type { RatedItem } from '../../types/rssa.types';
import { DISLIKE_CUTOFF, LIKE_CUTOFF } from '../../utils/constants';
import ConditionView from './ConditionView';
import LeftFormPanel from './LeftFormPanel';
import RightInfoPanel from './RightInfoPanel';

type PrefVizRequestObject = {
    user_id: string;
    user_condition: string;
    rec_type: 'baseline' | 'diverse' | 'reference';
    ratings: { item_id: number; rating: number }[];
};
const conditions = [
    {
        label: 'Diverse N Recommendations',
        options: [
            { id: 1, name: 'Continuous Coupled' },
            { id: 2, name: 'Continuous Decoupled' },
            { id: 3, name: 'Discrete Decoupled' },
            { id: 5, name: 'Continuous Decoupled - Self' },
            { id: 6, name: 'Discrete Decoupled - Self' },
        ],
    },
    {
        label: 'Top N Recommendations',
        options: [
            { id: 4, name: 'Baseline' },
            { id: 52, name: 'Continuous Decoupled - Self' },
            { id: 62, name: 'Discrete Decoupled - Self' },
        ],
    },
    {
        label: 'Referenced N Recommendations',
        options: [
            { id: 11, name: 'Continuous Coupled' },
            { id: 21, name: 'Continuous Decoupled' },
            { id: 31, name: 'Discrete Decoupled' },
            { id: 51, name: 'Continuous Decoupled - Self' },
            { id: 61, name: 'Discrete Decoupled - Self' },
        ],
    },
];
const PreferenceVisualizationContent: React.FC = () => {
    const { studyApi } = useStudy();
    const [loading, setLoading] = useState<boolean>(false);

    // FIXME:
    // Temporary state to get condition from URL for development testing
    // NOTE: Condition 5 is Baseline in the test study, so we will get TopN
    const [selectedCondition, setSelectedCondition] = useState(conditions[0].options[0]);

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: ratedMovies, isLoading: ratedMoviesLoading } = useQuery({
        queryKey: ['movieRatings'],
        queryFn: async () => await studyApi.get<RatedItem[]>(`responses/ratings`),
        staleTime: 1000 * 60 * 5,
    });

    const recommendationType = useMemo(() => {
        switch (selectedCondition.id) {
            case 4:
            case 52:
            case 62:
                return 'baseline';
            case 1:
            case 2:
            case 3:
            case 5:
            case 6:
                return 'diverse';
            case 11:
            case 21:
            case 31:
            case 51:
            case 61:
                return 'reference';
            default:
                return 'baseline';
        }
    }, [selectedCondition.id]);



    return (
        <div className="">
            <div className="">
                <Listbox value={selectedCondition} onChange={setSelectedCondition}>
                    <div className="flex flex-between relative mt-1 p-3">
                        <Label className="block text-md font-medium text-gray-700 me-3 content-center">Experiment condition:</Label>
                        <div>
                            <ListboxButton className={clsx("relative cursor-default rounded-lg bg-white py-2 pl-3 pr-10",
                                "text-left shadow-md sm:text-sm rounded-3",
                                "focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2",
                                "focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-300")}>
                                <span className="block truncate">{selectedCondition.name}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </ListboxButton>
                            <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <ListboxOptions className={clsx(
                                    "absolute mt-1 max-h-60 overflow-auto rounded-md",
                                    "bg-white py-1 text-base shadow-lg ring-1 ring-black/5",
                                    "focus:outline-none sm:text-sm"
                                )}
                                >
                                    {conditions.map((group) => (
                                        <div key={group.label}>
                                            <h3 className="text-sm font-bold p-2 text-gray-500">{group.label}</h3>
                                            {group.options.map((option) => (
                                                <ListboxOption
                                                    key={option.id}
                                                    className={clsx(
                                                        "relative cursor-default select-none py-2 pl-10 pr-4",
                                                        "hover:bg-amber-100 text-amber-900 text-gray-900 cursor-pointer"
                                                    )
                                                    }
                                                    value={option}
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                {option.name}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </ListboxOption>
                                            ))}
                                        </div>
                                    ))}
                                </ListboxOptions>
                            </Transition>
                        </div>
                    </div>
                </Listbox>
            </div>
            <div className="w-full flex flex-between gap-3">
                <div className="w-1/5">
                    <LeftFormPanel />
                </div>
                <div className="w-3/5">
                    {!ratedMoviesLoading ?
                        <ConditionView condition={selectedCondition.id} ratedItems={ratedMovies!} recommendationType={recommendationType} />
                        : <LoadingScreen loading={loading} message="Gathering your rated movies" />
                    }
                </div>
                <div className="w-1/5">
                    <RightInfoPanel
                        likeCutoff={LIKE_CUTOFF}
                        showLikeDislikeByLine={[4, 5, 6, 41, 51, 61].indexOf(selectedCondition.id) === -1}
                        dislikeCutoff={DISLIKE_CUTOFF}
                    />
                </div>
            </div>
        </div>
    );
};

const PreferenceVisualization = () => {
    return (
        <MovieSelectionProvider>
            <PreferenceVisualizationContent />
        </MovieSelectionProvider>
    );
};

export default PreferenceVisualization;
