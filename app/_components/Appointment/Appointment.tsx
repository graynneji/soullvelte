"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import FullCalendar from "@fullcalendar/react";
import type { DateClickArg } from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./Appointment.module.css";
import { fetchAppointments, scheduleAppointments } from "@/app/_lib/services";
import { useSearchParams } from "next/navigation";

/**
 * Event input for the calendar.
 */
interface NewEvent {
    title: string;
    start: string;
    backgroundColor: string;
    borderColor: string;
}

interface AppointmentEvent {
    id: string;
    title: string;
    start: string;
    backgroundColor: string;
    borderColor: string;
}

const DEFAULT_COLOR = "#3b82f6";

/**
 * Appointments component renders a calendar with the user's scheduled events
 * and allows the user to add new events via a modal form.
 *
 * - Fetches appointments for the user and therapist from the backend.
 * - Displays events in a FullCalendar week view.
 * - Allows the user to click a time slot to create a new event.
 * - Opens a modal to create and customize new events.
 *
 * @returns React component for managing and displaying appointments.
 */
const Appointment: React.FC = () => {
    // Get userId and therapistId from search params
    const searchParams = useSearchParams();
    const userId = searchParams.get("userID");
    const therapistId = searchParams.get("therapistId");

    // Selected color for new events
    const [color, setColor] = useState<string>(DEFAULT_COLOR);
    // Used to trigger reloading of appointments after creating a new event
    const [loaded, setLoaded] = useState(0);

    // Only create options and schedule if userId and therapistId are non-null
    const options =
        userId && therapistId
            ? {
                userId,
                therapistId,
                color,
            }
            : null;

    // Function to schedule an appointment (used in the modal form submit)
    const schedule = options
        ? scheduleAppointments.bind(null, options)
        : undefined;

    // Current list of events displayed in the calendar
    const [events, setEvents] = useState<AppointmentEvent[]>([]);

    // Modal state for creating a new event
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState<NewEvent>({
        title: "",
        start: "",
        backgroundColor: DEFAULT_COLOR,
        borderColor: DEFAULT_COLOR,
    });

    /**
     * Load appointments from the backend when user or therapist changes or when re-triggered.
     */
    useEffect(() => {
        async function loadAppointments() {
            // Ensure userId and therapistId are strings before calling the functions
            if (!userId || !therapistId) {
                return;
            }
            const resAppointment = await fetchAppointments(userId, therapistId);
            if (resAppointment.error || !resAppointment.data) {
                throw new Error(resAppointment.error);
            }
            setEvents(resAppointment.data || []);
        }
        loadAppointments();
    }, [loaded, userId, therapistId]);

    /**
     * Handler for when a date cell is clicked in the calendar.
     * Opens the modal with the selected date/time.
     *
     * @param info - Information about the clicked date/time slot.
     */
    const handleDateClick = (info: DateClickArg) => {
        setNewEvent({
            title: "",
            start: info.dateStr,
            backgroundColor: DEFAULT_COLOR,
            borderColor: DEFAULT_COLOR,
        });
        setShowModal(true);
    };

    /**
     * Handler for color selection for a new event.
     *
     * @param color - The selected color string.
     */
    const handleColorChange = (color: string) => {
        setColor(color);
        setNewEvent((prev) => ({
            ...prev,
            backgroundColor: color,
            borderColor: color,
        }));
    };

    /**
     * Handler for input changes in the modal form.
     *
     * @param e - The input change event.
     */
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewEvent((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /**
     * Handler for form submission for new event creation.
     * Updates the local event list and closes the modal.
     *
     * @param e - The form submit event.
     */
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newEvent.title.trim()) {
            setEvents([
                ...events,
                {
                    id: String(events.length + 1),
                    ...newEvent,
                },
            ]);
            setShowModal(false);
            setNewEvent({
                title: "",
                start: "",
                backgroundColor: DEFAULT_COLOR,
                borderColor: DEFAULT_COLOR,
            });
        }
    };

    /**
     * Format a date string for use in a "datetime-local" input.
     *
     * @param dateString - The date string to format.
     * @returns The formatted string or empty if invalid.
     */
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {/* Optionally add a calendar icon */}
                <h2 className={styles.title}>Schedule</h2>
            </div>
            <div className={styles.calendarContainer}>
                <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    events={events}
                    selectable={true}
                    dateClick={handleDateClick}
                    height="auto"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "timeGridWeek,timeGridDay",
                    }}
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    allDaySlot={false}
                    nowIndicator={true}
                    businessHours={{
                        daysOfWeek: [1, 2, 3, 4, 5],
                        startTime: "09:00",
                        endTime: "17:00",
                    }}
                    eventTimeFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        meridiem: "short",
                    }}
                />
            </div>

            {/* Custom Modal for Adding New Events */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                <span className={styles.iconWrapper}>
                                    {/* Pencil icon SVG */}
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M18.5 2.5C18.7626 2.23735 19.1088 2.07719 19.4714 2.05066C19.834 2.02414 20.1979 2.13321 20.4883 2.35523C20.7787 2.57725 20.9781 2.89933 21.0464 3.25806C21.1148 3.6168 21.0477 3.98908 20.858 4.297L13.5 13L10 14L11 10.5L18.5 2.5Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                                New Event
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className={styles.closeButton}
                                aria-label="Close"
                            >
                                {/* Close icon SVG */}
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 6L6 18"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M6 6L18 18"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Form for Event Creation */}
                        <form
                            action={async (formData: FormData) => {
                                // Schedule the appointment using the backend handler
                                if (schedule) {
                                    await schedule(formData);
                                    setLoaded((prev) => prev + 1); // Trigger reload of appointments
                                }
                                setShowModal(false);
                            }}
                            className={styles.modalBody}
                        >
                            <div className={styles.formGroup}>
                                <label htmlFor="title" className={styles.label}>
                                    Event Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={newEvent.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter event title"
                                    className={styles.input}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="datetime" className={styles.label}>
                                    Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="start"
                                    id="datetime"
                                    value={formatDateForInput(newEvent.start)}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Event Color</label>
                                <div className={styles.colorPicker}>
                                    {[
                                        "#3b82f6",
                                        "#10b981",
                                        "#f59e0b",
                                        "#ef4444",
                                        "#8b5cf6",
                                        "#ec4899",
                                    ].map((colorOption) => (
                                        <button
                                            key={colorOption}
                                            type="button"
                                            onClick={() => handleColorChange(colorOption)}
                                            className={`${styles.colorOption} ${newEvent.backgroundColor === colorOption
                                                ? styles.colorOptionSelected
                                                : ""
                                                }`}
                                            style={{ backgroundColor: colorOption }}
                                            aria-label={`Select ${colorOption} color`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className={styles.buttonCancel}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.buttonSave}>
                                    Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointment;