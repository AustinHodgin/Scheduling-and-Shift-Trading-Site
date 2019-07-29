#These are the needed inserts for the shift_type

#insert the selected temps to temp list for help desk
INSERT INTO _Temped_Shifts (original_owner, new_owner, help_desk_schedule_id, shift_type, time_stamp, comment) VALUES ((SELECT id FROM _Staff WHERE username=[user]), NULL, (SELECT id FROM _Help_Desk_Schedule WHERE id = [selected schedule id]), 'Help Desk', [time stamp], [comment]);


#insert the selected temps into temp list for labs
INSERT INTO _Temped_Shifts (original_owner, new_owner, lab_schedule_id, shift_type, time_stamp, comment) VALUES ((SELECT id FROM _Staff WHERE username=[user]), NULL, (SELECT id FROM _Lab_Schedule WHERE id = [selected schedule id]), 'Lab', [time stamp], [comment]);


#insert temps into the logged _Temped_Shifts for help desk
INSERT INTO _Logged_Temped_Shifts (original_owner,new_owner, help_desk_schedule_id, lab_schedule_id, shift_type, time_stamp, comments) VALUES ((SELECT original_owner FROM _Temped_Shifts WHERE id=[id]),(SELECT new_owner FROM _Temped_Shift WHERE id=[id]),(SELECT help_desk_schedule_id FROM _Temped_Shift WHERE id=[id]),(SELECT lab_schedule_id FROM _Temped_Shift WHERE id=[id]),(SELECT shift_type FROM _Temped_Shift WHERE id=[id]),(SELECT time_stamp FROM _Temped_Shift WHERE id=[id]));

#insert into staff table

INSERT INTO _Staff (first_name, last_name, username, email, phone_number, type, password_hash) VALUES ([user first name], [user last name], [username], [user email], [user phone number], [user type], [user password]);

#insert into help desk schedule
INSERT INTO  _Help_Desk_Schedule ( staff_id, shift_id, day) VALUES ((SELECT id FROM _Staff WHERE id=[id]), (SELECT id FROM _Help_Desk_Shifts WHERE id = [id]), [date]);

#insert into  Lab schedule
INSERT INTO  _Lab_Schedule ( staff_id, shift_id, day) VALUES ((SELECT id FROM _Staff WHERE id=[id]), (SELECT id FROM _Lab_Shifts WHERE id = [id]), [date]);
