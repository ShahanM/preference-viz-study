import React from "react"; 
import {Link} from "react-router-dom"

class SurveyPage extends React.Component {
    render() {
      return (
        <div>
          <h2>
            Survey Questions
          </h2>

          <ul> <h4>Visualization familiarity</h4>
            <li> I am competent when it comes to graphing and tabulating data. </li>
            <li> I frequently tabulate data with computer software. </li>
            <li> I have graphed a lot of data in the past. </li>
            <li> I frequently analyze data visualizations. </li>
            <li> I am familiar with data visualization. </li>
            <li> I am an expert at data visualization. </li>
          </ul>

          <ul> <h4>Visualization Quality</h4>
            <li> The visualizations are easy to understand </li>
            <li> The visualizations are difficult to understand </li>
            <li> The visualizations are informative about my taste </li>
            <li> The visualizations made me think about my likes and dislikes </li>
            <li> The visualizations helped me identify my unique likes and dislike</li>
            <li> The visualizations helped me take better informed decisions </li>
          </ul>

          <ul> <h4> Preference Exploring potential for self-actualization </h4>
            <li> </li>
            <li> </li>
            <li> </li>
            <li> </li>
            <li> </li>
            <li> </li>
          </ul>
          
          <ul> <h4>Preference Understanding potential for self-actualization / Taste clarification potential </h4>
            <li> The visualizations helped me identify my unique movie taste (more exploration) </li>
            <li> The visualizations helped me get a better idea about different types of movies I like</li>
            <li> The visualizations are informative about my taste </li>
            <li> The visualizations helped me understand what kind of movies I like. </li>
            <li> The visualizations made me more uncertain about my own preferences. </li>
            <li> The visualization will help better express my preferences in terms of movies. </li>
          </ul>


          <ul> <h4> Self-actualization Status</h4>
            <li> Which level do you identify moset at</li>
            <li> </li>
            <li> </li>
            <li> </li>
            <li> </li>
            <li> </li>
          </ul>
        </div>
      )
    }
  }
  export default SurveyPage