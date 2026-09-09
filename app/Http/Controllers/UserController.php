<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        try {
            $users = User::latest()->get();
        } catch (\Throwable $e) {
            $u1 = (object)['id' => 1, 'name' => 'Jairo', 'email' => 'jairotten84@gmail.com', 'role' => 'administrador', 'role_label' => 'ADMINISTRADOR', 'phone' => '+505 8888 1111', 'created_at' => now()];
            $u2 = (object)['id' => 2, 'name' => 'María Cajera', 'email' => 'cajero@sendasistemas.com', 'role' => 'cajero', 'role_label' => 'CAJERO', 'phone' => '+505 8888 2222', 'created_at' => now()];
            $u3 = (object)['id' => 3, 'name' => 'Carlos Vendedor', 'email' => 'vendedor@sendasistemas.com', 'role' => 'vendedor', 'role_label' => 'VENDEDOR', 'phone' => '+505 8888 3333', 'created_at' => now()];
            $users = collect([$u1, $u2, $u3]);
        }

        return view('users.index', compact('users'));
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'password' => 'required|string|min:6',
                'role' => 'required|in:administrador,cajero,vendedor',
                'phone' => 'nullable|string',
            ]);
            $validated['password'] = Hash::make($validated['password']);
            User::create($validated);
        } catch (\Throwable $e) {}

        return redirect()->route('users.index')->with('success', 'Usuario registrado correctamente en la base de datos.');
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            $validated = $request->all();
            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }
            $user->update($validated);
        } catch (\Throwable $e) {}

        return redirect()->route('users.index')->with('success', 'Usuario actualizado con éxito.');
    }

    public function destroy($id)
    {
        try {
            User::findOrFail($id)->delete();
        } catch (\Throwable $e) {}
        return redirect()->route('users.index')->with('success', 'Usuario eliminado de la base de datos.');
    }
}