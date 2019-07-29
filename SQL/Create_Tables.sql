#Create the tables for the temp site. This will create the staff, #help_desk_shifts,
#Lab_shifts, Help_desk_schedule,Lab_schedule, Temped and loged tables

CREATE TABLE _Staff (
	id INT NOT NULL AUTO_INCREMENT,
	first_name VARCHAR(255) NOT NULL,
	last_name VARChAR(255) NOT NULL,
	username VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	phone_number VARCHAR(255) NOT NULL,
	type VARCHAR(255) NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE _Help_Desk_Shifts (
	id INT NOT NULL AUTO_INCREMENT,
	start_time TIME,
	end_time TIME,
	day_of_week varchar(255),
	PRIMARY KEY(id)
);

CREATE TABLE _Lab_Shifts (
	id INT NOT NULL AUTO_INCREMENT,
	start_time TIME,
	end_time TIME,
	day_of_week varchar(255),
	PRIMARY KEY(id)
);

CREATE TABLE _Help_Desk_Schedule(
	id INT NOT NULL AUTO_INCREMENT,
	staff_id INT,
	shift_id INT,
	day DATE,
	FOREIGN KEY (staff_id) REFERENCES _Staff(id) ON DELETE CASCADE,
	FOREIGN KEY (shift_id) REFERENCES _Help_Desk_Shifts(id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);

CREATE TABLE _Lab_Schedule(
	id INT NOT NULL AUTO_INCREMENT,
	staff_id INT,
	shift_id INT,
	day DATE,
	FOREIGN KEY (staff_id) REFERENCES _Staff(id) ON DELETE CASCADE,
	FOREIGN KEY (shift_id) REFERENCES _Lab_Shifts(id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);

CREATE TABLE _Temped_Shifts (
	id INT NOT NULL AUTO_INCREMENT,
	original_owner int NOT NULL,
	new_owner int NOT NULL,
	help_desk_schedule_id int ,
	lab_schedule_id int,
	shift_type VARCHAR(255) NOT NULL,
	time_stamp TIMESTAMP NOT NULL,
	comments TEXT,
	FOREIGN KEY (original_owner) REFERENCES _Staff(id) ON DELETE CASCADE,
	FOREIGN KEY (new_owner) REFERENCES _Staff(id) ON DELETE CASCADE,
	FOREIGN KEY (help_desk_schedule_id) REFERENCES _Help_Desk_Schedule(id) ON DELETE CASCADE,
	FOREIGN KEY (LAB_schedule_id) REFERENCES _Lab_Schedule(id) ON DELETE CASCADE,
	PRIMARY KEY(id)
);

CREATE TABLE _Logged_Temped_Shifts (
	id INT NOT NULL AUTO_INCREMENT,
	original_owner int NOT NULL,
	new_owner int NOT NULL,
	help_desk_schedule_id int ,
	lab_schedule_id int,
	shift_type VARCHAR(255) NOT NULL,
	time_stamp TIMESTAMP NOT NULL,
	comments TEXT,
	FOREIGN KEY (original_owner) REFERENCES _Staff(id) ON DELETE CASCADE,
	FOREIGN KEY (new_owner) REFERENCES _Staff(id) ON DELETE CASCADE,
	FOREIGN KEY (help_desk_schedule_id) REFERENCES _Help_Desk_Schedule(id) ON DELETE CASCADE,
	FOREIGN KEY (LAB_schedule_id) REFERENCES _Lab_Schedule(id) ON DELETE CASCADE,
	PRIMARY KEY(id)
);
