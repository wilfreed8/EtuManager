<?php

namespace App\Http\Controllers;

use App\Models\AdminMessage;
use Illuminate\Http\Request;

class AdminMessageController extends Controller
{
    /**
     * Get active messages for an establishment
     */
    public function index(Request $request)
    {
        $establishmentId = $request->user()->establishment_id;
        
        $messages = AdminMessage::where('establishment_id', $establishmentId)
            ->active()
            ->with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Get all messages (admin only)
     */
    public function all(Request $request)
    {
        $establishmentId = $request->user()->establishment_id;
        
        $messages = AdminMessage::where('establishment_id', $establishmentId)
            ->with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Create a new message
     */
    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'priority' => 'required|in:info,warning,urgent',
            'expires_at' => 'nullable|date',
        ]);

        $message = AdminMessage::create([
            'establishment_id' => $request->user()->establishment_id,
            'created_by' => $request->user()->id,
            'message' => $request->message,
            'priority' => $request->priority,
            'expires_at' => $request->expires_at,
            'is_active' => true,
        ]);

        return response()->json($message->load('creator'), 201);
    }

    /**
     * Update a message
     */
    public function update(Request $request, $id)
    {
        $message = AdminMessage::where('establishment_id', $request->user()->establishment_id)
            ->findOrFail($id);

        $request->validate([
            'message' => 'sometimes|string',
            'priority' => 'sometimes|in:info,warning,urgent',
            'expires_at' => 'nullable|date',
            'is_active' => 'sometimes|boolean',
        ]);

        $message->update($request->only(['message', 'priority', 'expires_at', 'is_active']));

        return response()->json($message->load('creator'));
    }

    /**
     * Delete a message
     */
    public function destroy(Request $request, $id)
    {
        $message = AdminMessage::where('establishment_id', $request->user()->establishment_id)
            ->findOrFail($id);

        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}
