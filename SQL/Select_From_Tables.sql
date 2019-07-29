#This are the select statements needed for the temp site. [user] = the current #user using the site, [today] = current date

#Pull schedule for the home page
SELECT day, staff_id, shift_id FROM _Help_Desk_Schedule
INNER JOIN _Staff WHERE staff.id = _Help_Desk_Schedule.staff_id
INNER JOIN _Help_Desk_Shifts WHERE _Help_Desk_Shifts.id = _Help_Desk_Schedule.shift_id;


#Pull all temps for username who works help desk
SELECT id, orginal_owner, help_desk_schedule_id,  shift_type, start_time, end_time FROM _Temped_Shifts
INNER JOIN _Staff WHERE _Staff.id = _Temped_Shifts.orginal_owner
INNER JOIN _Help_desk_schedule WHERE _Help_Desk_Schedule.id = _Temped_Shifts.help_desk_schedule_id
INNER JOIN _Help_Desk_Shifts WHERE _Help_Desk_Shifts.id = _Help_Desk_Schedule.shift_id
WHERE _Help_Desk_Schedule.day >= [today];

#Pull all temps for user who works Lab_shifts
SELECT id, orginal_owner, lab_schedule_id,  shift_type, start_time, end_time FROM _Temped_Shifts
INNER JOIN _Staff WHERE _Staff.id = _Temped_Shifts.orginal_owner
INNER JOIN _Lab_schedule WHERE _Lab_Schedule.id = _Temped_Shifts.lab_schedule_id
INNER JOIN _Lab_Shifts WHERE _Lab_Shifts.id = _Lab_Schedule.shift_id
WHERE _Lab_Schedule.day >= [today];

#Select all logged temps for help desk from a certien DATE
SELECT id, orginal_owner, new_owner, help_desk_schedule_id, shift_type, time_stamp, comments FROM _Loged_Temped_Shifts
INNER JOIN _Staff WHERE _Staff.id = _Loged_Temped_Shifts.orginal_owner
INNER JOIN _Staff WHERE _Staff.id = _Loged_Temped_Shifts.new_owner
INNER JOIN _Help_Desk_Schedule WHERE _Help_Desk_Schedule.id = _Loged_Temped_Shifts.help_desk_schedule_id
INNER JOIN _Help_Desk_Shifts WHERE _Help_Desk_Shifts.id = _Help_Desk_Schedule.shift_id
WHERE time_stamp > [given date];

#Select all logged temps for help desk from a certien DATE
SELECT id, orginal_owner, new_owner,  lab_schedule_id, shift_type, time_stamp, comments FROM _Loged_Temped_Shifts
INNER JOIN _Staff WHERE _Staff.id = _Loged_Temped_Shifts.orginal_owner
INNER JOIN _Staff WHERE _Staff.id = _Loged_Temped_Shifts.new_owner
INNER JOIN _Lab_Schedule WHERE _Lab_Schedule.id = _Loged_Temped_Shifts.help_desk_schedule_id
INNER JOIN _Lab_Shifts WHERE _Lab_Shifts.id = _Help_Desk_Schedule.shift_id
WHERE time_stamp > [given date];
