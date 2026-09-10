<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function forgot(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $data['email'])->first();

        if ($user) {
            $token = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($token), 'created_at' => now()]
            );

            $resetLink = url('/reset-password?token='.$token.'&email='.urlencode($user->email));
            EmailService::send('password_reset', $user->email, [
                'name' => $user->name,
                'reset_link' => $resetLink,
            ]);
        }

        return response()->json([
            'message' => 'If that email exists, a reset link has been sent.',
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        if (! $record || ! Hash::check($data['token'], $record->token)) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        if (now()->diffInHours($record->created_at) > 24) {
            return response()->json(['message' => 'Reset token has expired.'], 422);
        }

        $user = User::where('email', $data['email'])->firstOrFail();
        $user->update(['password' => $data['password']]);

        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return response()->json(['message' => 'Password reset successfully. You can now log in.']);
    }
}
