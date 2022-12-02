// import Calendar  from '@fullcalendar/core';
// import interactionPlugin from '@fullcalendar/interaction';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import listPlugin from '@fullcalendar/list';
import axios from 'https://cdn.skypack.dev/axios';

const calendarData = async function getData() {
    return await axios.get('/calendar/extract');
}

document.addEventListener('DOMContentLoaded', async function() {
    var calendarEl = document.getElementById('calendar');
    const data = await calendarData();
    console.log(data)
    var calendar = new FullCalendar.Calendar(calendarEl, {
    //   plugins: [ interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin ],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      //initialDate: '2022-11-30',
      events: [
        { title: '"Task 0001"', start: '2022-12-31T03:50:00' },
        { title: '"SPRINT TEST"', start: '2022-12-22T03:48:00' },
        { title: '"Task 0007"', start: '2022-12-11T04:12:00' },
        { title: '"TASK 0009"', start: '2022-12-03T05:42:00' }
      ]
})

calendar.render();

});