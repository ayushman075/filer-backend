import { Data } from "../models/data.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import xml2js from 'xml2js'
import fs from 'fs'
import { ApiError } from "../utils/ApiError.js";

const uploadXML = AsyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json(new ApiResponse(400, {}, "No file uploaded!", false));
      throw new ApiError(400, "No file uploaded!");
    }
  
    const xmlFilePath = req.file.path;
    const xmlData = fs.readFileSync(xmlFilePath, "utf-8");
  
    xml2js.parseString(xmlData,{ explicitArray: false }, async (err, result) => {
      if (err) {
        res.status(500).json(new ApiResponse(500, {}, "Error parsing XML file!", false));
        throw new ApiError(500, "Error parsing XML file!");
      }
      let extractedData={}
      
      try {
  
        const profile =
          result?.INProfileResponse?.Current_Application?.Current_Application_Details?.Current_Applicant_Details || {};
        const creditSummary =
          result?.INProfileResponse?.CAIS_Account?.CAIS_Summary?.Credit_Account || {};
        const outstandingBalance =
          result?.INProfileResponse?.CAIS_Account?.CAIS_Summary?.Total_Outstanding_Balance || {};
        const score = result?.INProfileResponse?.SCORE || {};
        const capsSummary = result?.INProfileResponse?.TotalCAPS_Summary || {};
        const creditAccounts =
        result?.INProfileResponse?.CAIS_Account?.CAIS_Account_DETAILS || [];
       
         extractedData= {
          name: `${profile.First_Name || ""} ${profile.Last_Name || ""}`.trim(),
          mobilePhone: profile.MobilePhoneNumber || "",
          pan:
            profile.IncomeTaxPan ||
            result?.INProfileResponse?.CAIS_Account?.CAIS_Account_DETAILS?.CAIS_Holder_Details?.Income_TAX_PAN ||
            "",
          creditScore: parseInt(score.BureauScore, 10) || 0,
          reportSummary: {
            totalAccounts: parseInt(creditSummary?.CreditAccountTotal, 10) || 0,
            activeAccounts: parseInt(creditSummary?.CreditAccountActive, 10) || 0,
            closedAccounts: parseInt(creditSummary?.CreditAccountClosed, 10) || 0,
            currentBalanceAmount: parseFloat(outstandingBalance?.Outstanding_Balance_All) || 0,
            securedAccountsAmount: parseFloat(outstandingBalance?.Outstanding_Balance_Secured) || 0,
            unsecuredAccountsAmount: parseFloat(outstandingBalance?.Outstanding_Balance_UnSecured) || 0,
            last7DaysCreditEnquiries: parseInt(capsSummary?.TotalCAPSLast7Days, 10) || 0,
          },
          creditAccounts:Array.isArray(creditAccounts)
          ? creditAccounts.map((account) => ({
              creditCard: account?.Portfolio_Type || "Unknown",
              bank: account?.Subscriber_Name || "Unknown",
              address: account?.CAIS_Holder_Address_Details?.First_Line_Of_Address_non_normalized || "N/A",
              accountNumber: account?.Account_Number || "N/A",
              amountOverdue: parseFloat(account?.Amount_Past_Due) || 0,
              currentBalance: parseFloat(account?.Current_Balance) || 0,
            }))
          : [],
          createdBy: req.user._id, 
        };
  
      } catch (error) {
        console.error("Error extracting data:", error);
        res.status(400).json(new ApiResponse(400, {}, "Error parsing the XML, Please try again!", false));
        throw new ApiError(400, "Error parsing the XML, Please try again!");
        
      }

      if(!extractedData.name || !extractedData.mobilePhone ){
        res.status(400).json(new ApiResponse(400, {}, "Some field are empty, Please try again!", false));
        throw new ApiError(400, "Some field are empty, Please try again!");
      }
  

      const savedData = await Data.findOneAndUpdate({mobilePhone:extractedData.mobilePhone},extractedData,{upsert:true,new:true});

      
  
      if (!savedData) {
        res.status(500).json(new ApiResponse(500, {}, "Error saving extracted data!", false));
        throw new ApiError(500, "Error saving extracted data!");
      }
  
      return res.status(201).json(new ApiResponse(201, savedData, "Data extracted and saved successfully", true));
    });
  });



  const getData = AsyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search } = req.query;
    const query = search ? { name: new RegExp(search, "i") } : {};
    const data = await Data.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Data.countDocuments(query);
    const currentPage = page;
    const totalPage = Math.ceil(total/limit)
    res.status(200).json(new ApiResponse(200, { data, total, currentPage, totalPage }, "Data fetched successfully", true));
  });
  

  const getDataById = AsyncHandler(async (req, res) => {
    const data = await Data.findById(req.params.id);
    if (!data) throw new ApiError(404, "Data not found");
    res.status(200).json(new ApiResponse(200, data, "Data fetched successfully", true));
  });
  
  
  const updateData = AsyncHandler(async (req, res) => {
    if(!req.body.name || !req.body.mobilePhone || !req.body.pan || !req.body.creditScore){
        res.status(400).json(new ApiResponse(400, {}, "Some field are empty, Please try again!", false));
        throw new ApiError(400, "Some field are empty, Please try again!");
      }
    const updatedData = await Data.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedData) throw new ApiError(404, "Data not found");
    res.status(200).json(new ApiResponse(200, updatedData, "Data updated successfully", true));
  });
  

  const deleteData = AsyncHandler(async (req, res) => {
    const deletedData = await Data.findByIdAndDelete(req.params.id);
    if (!deletedData) throw new ApiError(404, "Data not found");
    res.status(200).json(new ApiResponse(200, {}, "Data deleted successfully", true));
  });


  const getAnalytics = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const user = await User.findById(userId);

    if(!user || !user.status=='active'){
      return res.status(403).json(new ApiResponse(403,{},"Unautorized request",false));
    }
    
    const analytics = await Data.aggregate([
      {
        $facet: {
          creditScoreDistribution: [
            {
              $group: {
                _id: {
                  $switch: {
                    branches: [
                      { case: { $lte: ["$creditScore", 600] }, then: "Poor" },
                      { case: { $lte: ["$creditScore", 700] }, then: "Fair" },
                      { case: { $lte: ["$creditScore", 800] }, then: "Good" },
                      { case: { $lte: ["$creditScore", 900] }, then: "Excellent" }
                    ],
                    default: "Unknown"
                  }
                },
                count: { $sum: 1 }
              }
            }
          ],
          monthlyStats: [
            {
              $group: {
                _id: {
                  month: { $month: "$createdAt" },
                  year: { $year: "$createdAt" }
                },
                avgCreditScore: { $avg: "$creditScore" },
                totalApplications: { $sum: 1 },
                totalActiveAccounts: { $sum: "$reportSummary.activeAccounts" },
                totalClosedAccounts: { $sum: "$reportSummary.closedAccounts" }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ],
          loanStats: [
            {
              $group: {
                _id: null,
                totalSecuredAmount: { $sum: "$reportSummary.securedAccountsAmount" },
                totalUnsecuredAmount: { $sum: "$reportSummary.unsecuredAccountsAmount" },
                avgEnquiries: { $avg: "$reportSummary.last7DaysCreditEnquiries" }
              }
            }
          ],
          bankDistribution: [
            { $unwind: "$creditAccounts" },
            {
              $match: {
                "creditAccounts.bank": { $ne: null } // Ignore empty banks
              }
            },
            {
              $group: {
                _id: "$creditAccounts.bank",
                totalAccounts: { $sum: 1 },
                totalAmountOverdue: { $sum: "$creditAccounts.amountOverdue" },
                totalCurrentBalance: { $sum: "$creditAccounts.currentBalance" }
              }
            },
            { $sort: { totalAccounts: -1 } },
            
          ]
          
          
        }
      }
    ]);
    return res.status(200).json(new ApiResponse(200,analytics[0],"Analytics fetched successfully!",true))
  });


  export {uploadXML, getData, getDataById, updateData, deleteData, getAnalytics}