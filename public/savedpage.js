
function makeTable() {
    $.ajax({
        url: "/api/saved",
        method: "GET"
    }).then(function (data) {
        for (let post of data) {
            if (post.saved === true) {
                let newTH = $("<th>");
                let newTR = $("<tr>");
                let saveButton = $("<button>");
                let noteButton = $("<button>");
                saveButton.text("Unsave this link!");
                saveButton.attr("postid", post._id);
                saveButton.addClass("save-btn");
                noteButton.text("Notes");
                noteButton.attr("postid", post._id);
                noteButton.addClass("note-btn");
                newTH.html("<a href=" + post.link + "><p>" + post.title + "</p></a>");
                newTR.append(newTH);
                newTR.append(saveButton);
                newTR.append(noteButton);
                $("#postbodies").append(newTR);
            }
        }
        $(".save-btn").on("click", function (event) {
            event.preventDefault();
            $.ajax({
                url: "/api/unsave/" + $(this).attr("postid"),
                method: "POST"
            }).then(function (data) {
                console.log("Moved post with ID " + $(this).attr("postid") + " to unsaved articles!")
            });
        });
        $(".note-btn").on("click", function (event) {
            event.preventDefault();
            $("#notes-display").empty();
            var postid = $(this).attr("postid")
            $("#notes-title").text("notes for artice id: " + postid);
            $('.modal').modal();
            $('.modal').modal("open");
            $("#submit-btn").attr("postid", postid);
            $.ajax({
                url: "/api/note/" + postid,
                method: "GET",
            }).then(function (data) {

                if (data.note) {
                    let newNote = $("<p>");
                    newNote.text(JSON.stringify(data.note));
                    let newButton = $("<button>");
                    newButton.text("Delete");
                    newButton.attr("class", "delete-btn");
                    newButton.attr("postid", postid);
                    newNote.append(newButton);
                    $("#notes-display").append(newNote);
                }
                
                $(".delete-btn").on("click", function (event) {
                    event.preventDefault();
                    $("#notes-display").empty();
                    $.ajax({
                        url: "/api/note/delete/" + $(this).attr("postid"),
                        method: "DELETE"
                    }).then(function (result) {
                        $("#notes-display").empty();
                        console.log("Deleted note!");
                        console.log(result);
                    });
                });
            })
        });

        $("#submit-btn").on("click", function (event) {
            event.preventDefault();
            $.ajax({
                url: "/api/note/" + $(this).attr("postid"),
                method: "POST",
                data: { note: $("#note-text").val().trim(), },
                dataType: "json"
            }).then(function (result) {
                console.log("note posted");
            });
        });


    });
}



makeTable();