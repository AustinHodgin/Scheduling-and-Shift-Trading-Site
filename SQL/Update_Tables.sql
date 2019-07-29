#These update statments are the needed SQL to update all the needed tables for #the site


#Update _Temped_Shift with  new_owner

UPDATE _Temped_Shift
SET new_owner = (SELECT id FROM _Staff WhERE id=[id])
WHERE id = [given id];


#Update _Help_Desk_Schedule

UPDATE _Help_Desk_Schedule
SET staff_id = (SELECT id FROM _Staff WHERE id=[user])
WHERE id = [shift id];


#Update _Lab_Schedule

UPDATE _Lab_Schedule
SET staff_id = (SELECT id FROM _Staff WHERE id=[user])
WHERE id = [shift id];
