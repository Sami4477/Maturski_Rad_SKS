document.addEventListener('DOMContentLoaded', () => {
    const classScheduleDiv = document.getElementById('class-schedule');
    const mirrorButton = document.getElementById('mirror-button');
    const classButtons2Div = document.getElementById('class-buttons-2');
    const classButtons3Div = document.getElementById('class-buttons-3');
    let currentSchedule = null;

    fetch('/logo')
        .then(response => response.json())
        .then(data => {
            const logo = document.getElementById('logo');
            logo.src = data.logo;
        })
        .catch(error => console.error('Greška pri učitavanju logotipa:', error));

    createClassButtons(2, classButtons2Div);
    createClassButtons(3, classButtons3Div);

    function createClassButtons(grade, container) {
        for (let i = 1; i <= 6; i++) {
            const button = document.createElement('button');
            button.textContent = `${grade}-${i}`;
            button.onclick = () => showSchedule(`${grade}-${i}`);
            container.appendChild(button);
        }
    }

    window.showSchedule = function(classId) {
        fetch(`/schedule/${classId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Nisam jos dodao vas raspored, Kontakirajte me na email pa cu dodati, Hvala');
                }
                return response.json();
            })
            .then(data => {
                currentSchedule = data;
                classScheduleDiv.innerHTML = createScheduleHtml(data);
                mirrorButton.style.display = 'block';
            })
            .catch(error => {
                classScheduleDiv.innerHTML = `<p>Greška: ${error.message}</p>`;
                mirrorButton.style.display = 'none';
            });
    };

    function createScheduleHtml(schedule) {
        const times = ['8:00-8:45', '8:50-9:35', '9:40-10:25', '10:45-11:30', '11:35-12:20', '12:25-13:10', 
                       '13:40-14:25', '14:30-15:15', '15:20-16:05', '16:25-17:10', '17:15-18:00', '18:05-18:50'];
        let html = '<table><tr><th>Vrijeme</th><th>PON</th><th>UTO</th><th>SRI</th><th>ČET</th><th>PET</th></tr>';
        times.forEach((time, index) => {
            html += `<tr><td>${time}</td>`;
            ['PON', 'UTO', 'SRI', 'CET', 'PET'].forEach(day => {
                if (schedule[day] && Array.isArray(schedule[day][index])) {
                    const [subject, room] = schedule[day][index];
                    html += `<td>${subject}${room ? `<small>${room.toLowerCase()}</small>` : ''}</td>`;
                } else {
                    html += '<td></td>';
                }
            });
            html += '</tr>';
        });
        html += '</table>';
        return html;
    }

    window.mirrorSchedule = function() {
        if (!currentSchedule) {
            alert('Nema rasporeda za ogledalo!');
            return;
        }

        const mirroredSchedule = {};
        for (const [day, subjects] of Object.entries(currentSchedule)) {
            mirroredSchedule[day] = subjects.reverse();
        }

        const lastLessonTime = findLastLessonTime(currentSchedule);
        const newStartTime = calculateNewStartTime(lastLessonTime);

        classScheduleDiv.innerHTML = createScheduleHtml(mirroredSchedule);
        alert(`Obrnuo sam raspored`);
    };

    function findLastLessonTime(schedule) {
        const times = ['8:00', '8:50', '9:40', '10:45', '11:35', '12:25', '13:40', '14:30', '15:20', '16:25', '17:15', '18:05'];
        for (let i = times.length - 1; i >= 0; i--) {
            for (const day in schedule) {
                if (schedule[day][i]) {
                    return times[i];
                }
            }
        }
        return '8:00';
    }

    function calculateNewStartTime(lastTime) {
        const [hours, minutes] = lastTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const minutesToEnd = 18 * 60 + 50 - totalMinutes;
        const newStartMinutes = 8 * 60 + Math.min(50, minutesToEnd);
        const newHours = Math.floor(newStartMinutes / 60);
        const newMinutes = newStartMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    }

    mirrorButton.style.display = 'none';
});