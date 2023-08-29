#!/usr/bin/env python3

# This script can be either imported or run directly from the command line
# If run directly, it will add a salt to each ["results"]n["meet"] field in _rooms.json
# and save the result to rooms.json
import sys
import os

# Add the parent directory to the path so we can import the module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Salt can be passed in as an argument, or will be generated randomly if not provided
try:
    salt = sys.argv[1]
except IndexError:
    import random
    # Generate a random salt as a string of four emoji characters
    # Alternatively, you could use a random string of letters and numbers
    salt = ''.join(random.choice('😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😗😙😚😋🤗🤓😎🤠😶😐😑😮🤔') for i in range(4))


import json
with open("_rooms.json", "r") as f:
    data = json.load(f)

# Create a class that imports and holds the data
class Rooms:
    def __init__(self):
        with open("_rooms.json", "r") as f:
            self.data = json.load(f)

    def get(self):
        return self.data
        
    def salt_whiteboard(self):
        #data["results"][1]["classroom"]["app_set"][0]["iframe"]
        self.data["results"][1]["classroom"]["app_set"][0]["iframe"] = self.data["results"][1]["classroom"]["app_set"][0]["iframe"] + "-" + salt
        return self.data
    
    def add_salt(self, room):
        room["salt"] = salt
        return room
    
    def salt_rooms(self):
        self.data["results"] = list(map(self.add_salt, self.data["results"]))
        return self.data
    
    def salt(self):
        self.data["salt"] = salt
        return self.data

    def get_room(self, room_id):
        for room in self.data["results"]:
            if room["id"] == room_id:
                return room
        return None

    def save(self):
        with open("rooms.json", "w") as f:
            json.dump(self.data, f, indent=4)


if __name__ == "__main__":
    ''' 
    If this script is run directly, add the salt to each room and save the result to rooms.json
    '''
    rooms = Rooms()
    rooms.salt_rooms()
    rooms.salt()
    rooms.salt_whiteboard()
    rooms.save()
    print("Salted rooms saved to rooms.json")

