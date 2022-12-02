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
      initialDate: '2022-11-30',
      events: data
})

calendar.render();

});