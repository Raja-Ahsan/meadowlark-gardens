<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/** In-app (bell) notification stored in the database. */
class SiteNotification extends Notification
{
    public function __construct(
        public string $kind,
        public string $title,
        public string $message = '',
        public ?string $url = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind' => $this->kind,
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
        ];
    }
}
