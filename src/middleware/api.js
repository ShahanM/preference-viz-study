import { get, put, post } from './requests';

const RSSA_API = process.env.REACT_APP_RSSA_API || 'missing';
const RSSA_API_DEV = process.env.REACT_APP_RSSA_API_DEV || 'missing';

const API = process.env.NODE_ENV === "production" ? RSSA_API : RSSA_API_DEV;


const requestBodyMeta = (userdata, pageid) => {
	return {
		user_id: userdata.id,
		study_id: userdata.study_id,
		page_id: pageid
	}
}

export function createUser(userType: string, studyId: int) {
	return post('user/consent/', {
		study_id: studyId,
		user_type: 'ersStudy'
	}, { study_id: studyId })
}

export function getStudy(studyid) {
	return get('study/' + studyid)
		.then((response): Promise<studyres> => response.json())
		.then((studyres: studyres) => {
			return studyres;
		});
}

export function getFirstStudyStep(studyid) {
	return get('study/' + studyid + '/step/first/')
		.then((response): Promise<StudyStepRes> => response.json())
		.then((studyStepRes: studyStepRes) => {
			return studyStepRes;
		})
}

export function getNextStudyStep(studyid, stepid) {
	return get('study/' + studyid + '/step/' + stepid + '/next')
		.then((response): Promise<step> => response.json())
		.then((step: step) => {
			return step;
		})
}

export function sendLog(userdata, stepid, pageid: int, timespent: int,
	inttype: string, target: string, itemid: int, rating: int) {
	const data = {
		...requestBodyMeta(userdata, pageid),
		step_id: stepid,
		time_spent: timespent,
		interaction_type: inttype, interaction_target: target,
		item_id: itemid, rating: rating
	}
	return put('user/' + userdata.id + '/log/', data, userdata)
		.then((response): Promise<log> => response.json())
		.then((log: log) => {
			return log;
		})
}

export function submitResponse(responseType: string, userdata, pageid,
	responses) {
	const data = {
		...requestBodyMeta(userdata, pageid),
		responses: responses
	}
	const url = 'user/' + userdata.id + '/response/' + responseType + '/';
	return put(url, data, userdata);
}

export function getSurveyPage(studyid, stepid, pageid) {
	let path = 'study/' + studyid + '/step/' + stepid + '/page/' + pageid;
	if (pageid === null) {
		path = 'study/' + studyid + '/step/' + stepid + '/page/first/';
	}
	return get(path)
		.then((response): Promise<page> => response.json())
		.then((page: page) => {
			return page;
		})
}
