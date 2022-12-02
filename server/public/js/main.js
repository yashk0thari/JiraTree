import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';
import { response } from 'express';

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    const output = db.getDateNotBacklog();
    const entries = output.rows;
    const data = []
    for (let i = 0; i < entries.length; i++){
        calData = {title: entries[i].task_name, start: entries[i].deadline};
        data.push(calData);
    }
    
    const fetch = ()=>{
        axios.get(`http://localhost:8080/calendar/:project_uid`)
        .then(response)
    }
    var calendar = new Calendar(calendarEl, {
      plugins: [ interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin ],
      initialView: 'dayGridMonth',
      //initialDate: '2022-11-07',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      initialDate: '2022-11-30',
      events: data,
})
});
